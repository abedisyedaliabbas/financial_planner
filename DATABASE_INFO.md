# Database Information

## Database Location

The SQLite database file is stored at:
```
server/financial_tracker.db
```

## Important Notes

1. **Database Persistence**: The database file is stored locally on the server. It will persist between server restarts as long as the file is not deleted.

2. **Database File**: The database file (`financial_tracker.db`) is **NOT** tracked in git (it's in `.gitignore` for security reasons). This means:
   - Each deployment/server instance has its own database
   - The database file must exist on the server where the application runs
   - If the database file is deleted, all data will be lost

3. **Verification**: To verify the database and check stored users, run:
   ```bash
   node server/verify-db.js
   ```

4. **Backup**: It's recommended to regularly backup the `server/financial_tracker.db` file, especially in production.

## Troubleshooting

### Users Not Persisting

If users are not being saved:

1. **Check Database File Exists**:
   ```bash
   ls -la server/financial_tracker.db
   ```

2. **Check Server Logs**: Look for database initialization messages:
   - `✅ Connected to SQLite database`
   - `✅ New user registered: email@example.com`

3. **Verify Database**: Run the verification script:
   ```bash
   node server/verify-db.js
   ```

4. **Check Permissions**: Ensure the server has read/write permissions to the `server/` directory.

### Database Not Found

If you see errors about the database not being found:

1. The database file will be created automatically on first run
2. Ensure the `server/` directory exists and is writable
3. Check server logs for database initialization errors

## Production Recommendations

For production deployments:

1. **Use a Persistent Volume**: Ensure the database file is stored on a persistent volume that survives container/server restarts
2. **Regular Backups**: Set up automated backups of the database file
3. **Consider PostgreSQL/MySQL**: For production, consider migrating to PostgreSQL or MySQL for better reliability and scalability


