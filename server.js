



/**
 * Start Server
 */
app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});