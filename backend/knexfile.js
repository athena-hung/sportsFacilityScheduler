module.exports = {
    development: {
        client: 'pg', // PostgreSQL client
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
    },
};
