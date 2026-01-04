# Debugging Internal Server Errors

## Steps to Debug:

1. **Check Server Console**: Look at the terminal where `npm run dev` is running. You should see detailed error logs now.

2. **Common Issues**:
   - Missing required fields (now validated)
   - Database connection issues
   - SQL syntax errors
   - Missing columns in database

3. **What I Fixed**:
   - Added detailed error logging to all POST routes
   - Added validation for required fields
   - Added global error handler
   - Improved error messages

4. **To See Detailed Errors**:
   - Check the server terminal output
   - Check browser console (F12)
   - Error messages now include stack traces in development mode

## Next Steps:
1. Try adding an item again
2. Check the server terminal for the detailed error
3. Share the error message from the server console

