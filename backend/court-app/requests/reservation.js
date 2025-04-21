const express = require('express');
const router = express.Router();
const db = require('../db'); 

// New endpoint to get reservations with optional filters 
router.get('/', async (req, res) => {
  const { start, end, reason, courtId, personId, status } = req.query;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  try {
    const query = db('reservation').where(true); 
    if (!isAdmin) {
      query.andWhere('user_id', user.id);
    } else if (personId) {
      query.andWhere('user_id', personId);
    }

    if (start) {
      const startDate = new Date(start);
      if (!isNaN(startDate.getTime())) {
        const dateStr = startDate.toISOString().split('T')[0]; 
        const startOfDayStr = `${dateStr} 00:00:00`;
        query.andWhere('start', '>=', startOfDayStr);
      }
    }

    if (end) {
      const endDate = new Date(end);
      if (!isNaN(endDate.getTime())) {
        const dateStr = endDate.toISOString().split('T')[0]; 
        const endOfDayStr = `${dateStr} 23:59:59`;
        query.andWhere('end', '<=', endOfDayStr);
      }
    } else {
      const currentDate = new Date();
      const currentDateStr = currentDate.toISOString().split('T')[0]; 
      const currentTimeStr = currentDate.toTimeString().split(' ')[0].substring(0, 5); 
      const currentDateTimeStr = `${currentDateStr} ${currentTimeStr}`;
      query.andWhere('end', '>=', currentDateTimeStr);
    }

    if (reason) {
      query.andWhere('reason', 'like', `%${reason}%`);
    }

    if (courtId) {
      query.andWhere('court_id', courtId);
    }

    if (status) {
      query.andWhere('status', status);
    }

    const result = await query; 

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Reservation creation endpoint (POST /reservation)
router.post('/', async (req, res) => {
  const { start, end, reason, notes, courtId, status, personId } = req.body;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  if (!start || !end || !courtId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate >= endDate) {
    return res.status(400).json({ message: 'Start time must be before end time' });
  }

  try {
    const reservationUserId = (isAdmin && personId) ? personId : user.id;
    const reservationUser = await db('user').where({ id: reservationUserId }).first();
    if (!reservationUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const court = await db('court')
      .where({ 
        id: courtId,
        org_id: user.org_id 
      })
      .first();
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found or does not belong to your organization' });
    }

    const courtTypes = await db('court_court_type')
      .join('court_type', 'court_court_type.court_type_id', 'court_type.id')
      .where('court_court_type.court_id', courtId)
      .select('court_type.*');
    
    if (!courtTypes || courtTypes.length === 0) {
      return res.status(404).json({ message: 'No court types found for this court' });
    }
    
    const courtType = courtTypes[0];

    const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));

    if (durationMinutes > courtType.maxReservationTime) {
      return res.status(400).json({ 
        message: `Reservation exceeds maximum allowed time of ${courtType.maxReservationTime} minutes for this court type` 
      });
    }

    if (!isAdmin) {
      const activeReservationsCount = await db('reservation')
        .where({ user_id: req.user.id })
        .whereNot({ status: 'Cancelled' })
        .where('start', '>=', new Date().toISOString())
        .count('id as count')
        .first();

      if (parseInt(activeReservationsCount.count) >= req.user.maxCourtsPerDay) {
        return res.status(400).json({ 
          message: `User has reached the maximum limit of ${req.user.maxCourtsPerDay} future reservations` 
        });
      }
    }

    const dayOfWeek = startDate.getDay() === 0 ? 7 : startDate.getDay(); 
    const openHours = await db('open_hour').where({ court_id: courtId, dayOfWeek });
    if (!openHours || openHours.length === 0) {
      return res.status(400).json({ message: "Court is closed on the selected day" });
    }

    const reqStartMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const reqEndMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    let withinOpenHours = false;
    for (const oh of openHours) {
      const [ohStartHour, ohStartMin] = oh.startTime.split(':').map(Number);
      const [ohEndHour, ohEndMin]   = oh.endTime.split(':').map(Number);
      const ohStart = ohStartHour * 60 + ohStartMin;
      const ohEnd   = ohEndHour * 60 + ohEndMin;
      if (reqStartMinutes >= ohStart && reqEndMinutes <= ohEnd) {
        withinOpenHours = true;
        break;
      }
    }
    if (!withinOpenHours) {
      return res.status(400).json({ message: "Reservation time does not fall within the court's open hours" });
    }

    let reservations;
    try {
      const reqDateStr = startDate.toISOString().split('T')[0]; 
      const startOfDayStr = `${reqDateStr} 00:00:00`;
      const endOfDayStr = `${reqDateStr} 23:59:59`;

      reservations = await db('reservation')
        .where('court_id', courtId)
        .whereNot({ status: 'Cancelled' })
        .andWhere(function() {
          this.where(function() {
            this.where('start', '>=', startOfDayStr)
                .andWhere('start', '<=', endOfDayStr);
          })
          .orWhere(function() {
            this.where('end', '>', startOfDayStr)
                .andWhere('end', '<=', endOfDayStr);
          })
          .orWhere(function() {
            this.where('start', '<', startOfDayStr)
                .andWhere('end', '>', endOfDayStr);
          });
        });
    } catch (err) {
      console.error("Error retrieving reservations for overlap check:", err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const hasOverlap = reservations.some(r => {
      const [rStartHour, rStartMin] = r.start.split(' ')[1].split(':').map(Number);
      const [rEndHour, rEndMin]     = r.end.split(' ')[1].split(':').map(Number);
      const reservationStartMinutes = rStartHour * 60 + rStartMin;
      const reservationEndMinutes   = rEndHour * 60 + rEndMin;
      return reqStartMinutes < reservationEndMinutes && reqEndMinutes > reservationStartMinutes;
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Court is already reserved during the requested time' });
    }

    let price = 0;
    const pricing = await db('pricing')
      .where({
        'court_id': courtId,
        'member_type_id': reservationUser.member_type_id
      })
      .first();
    
    if (pricing && pricing.price) {
      price = (pricing.price / 60) * durationMinutes;
    }

    const [reservation] = await db('reservation').insert({
      start,
      end,
      reason: reason || null,
      notes: notes || null,
      court_id: courtId,
      user_id: reservationUserId,
      org_id: user.org_id,
      status: isAdmin ? (status || 'Confirmed') : 'Pending',
      price: price
    }).returning('*');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Reservation update endpoint (PUT /reservation/:id)
router.put('/:id', async (req, res) => {
  const reservationId = req.params.id;
  const { start, end, reason, notes, courtId, personId, status } = req.body;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  try {
    const reservation = await db('reservation').where({ id: reservationId }).first();
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (!isAdmin && reservation.user_id !== user.id) {
      return res.status(403).json({ message: 'You are not allowed to update this reservation' });
    }

    const newUserId = (isAdmin && personId) ? personId : user.id;

    const updatedData = {
      ...(start !== undefined && { start }),
      ...(end !== undefined && { end }),
      ...(reason !== undefined && { reason }),
      ...(notes !== undefined && { notes }),
      ...(courtId !== undefined && { court_id: courtId }),
      user_id: newUserId,
    };
    
    if (status === 'Cancelled' || isAdmin) {
      updatedData.status = status || reservation.status;
    }

    const [updatedReservation] = await db('reservation')
      .where({ id: reservationId })
      .update(updatedData)
      .returning('*');

    res.status(200).json({
      message: 'Reservation updated successfully',
      reservation: updatedReservation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Payment confirmation endpoint (POST /reservation/confirm)
// This endpoint doesn't confirm that payment was actually recieved, it just takes a dummy payment amount and updates the reservation status to confirmed
router.post('/confirm', async (req, res) => {
  const { reservationId, paymentAmount } = req.body;
  const user = req.user;

  if (!reservationId || paymentAmount === undefined) {
    return res.status(400).json({ message: 'Missing required fields: reservationId and paymentAmount' });
  }

  try {
    const reservation = await db('reservation').where({ id: reservationId }).first();
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const memberType = await db('member_type').where({ id: user.member_type_id }).first();
    const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';
    
    if (!isAdmin && reservation.user_id !== user.id) {
      return res.status(403).json({ message: 'You are not authorized to confirm payment for this reservation' });
    }

    if (reservation.status === 'Confirmed') {
      return res.status(400).json({ message: 'This reservation is already confirmed, no payment needed' });
    }
    
    if (reservation.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot confirm payment for a cancelled reservation' });
    }

    if (parseFloat(paymentAmount) < parseFloat(reservation.price)) {
      return res.status(400).json({ 
        message: `Payment amount (${paymentAmount}) is less than the required price (${reservation.price})` 
      });
    }

    const paymentDate = new Date().toISOString();

    const [updatedReservation] = await db('reservation')
      .where({ id: reservationId })
      .update({ 
        status: 'Confirmed',
        payment_amount: paymentAmount,
        payment_date: paymentDate
      })
      .returning('*');

    res.status(200).json({
      message: 'Payment confirmed and reservation status updated to Confirmed',
      reservation: updatedReservation
    });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router; 