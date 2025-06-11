# RentMyVenue Deployment Guide

## Database Setup with phpMyAdmin

1. Log in to cPanel dashboard
2. Go to **MySQL Databases**:
   - Create database: `your_cpanel_username_rentmyvenue`
   - Create user: `your_cpanel_username_admin` - 3WkztC_wE2KCs2b
   - Add user to database with all privileges

3. Access phpMyAdmin:
   - Click phpMyAdmin icon in cPanel
   - Select your database
   - Note: Tables will be created when running migrations

## Backend Deployment

1. Install MySQL client:
```bash
pip install mysqlclient
# Or if that fails:
pip install PyMySQL
```

2. Set environment variables in cPanel:
```
DB_NAME=your_cpanel_username_rentmyvenue
DB_USER=your_cpanel_username_admin
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306
DJANGO_SECRET_KEY=your_secret_key
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

3. Run migrations:
```bash
python manage.py migrate --settings=config.settings_prod
```

4. Collect static files:
```bash
python manage.py collectstatic --settings=config.settings_prod
```

## Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Upload to cPanel:
   a. Create a ZIP file of your build:
      ```bash
      cd frontend/dist
      zip -r ../build.zip *
      ```
      On Windows:
      - Right-click the dist folder
      - Select "Send to" -> "Compressed (zipped) folder"
      - Rename it to build.zip

   b. Upload using File Manager:
      - Go to File Manager in cPanel
      - Navigate to `public_html`
      - Click "Upload" and select your build.zip
      - Once uploaded, click on build.zip
      - Select "Extract" from the top menu
      - Extract to public_html directory
      - Delete the zip file after extraction

   Note: If you can't upload ZIP files or extract them:
   1. Create a new folder in public_html (e.g., 'mysite')
   2. Open your local dist folder
   3. Upload each file individually to the folder you created
   4. Key files to upload:
      - index.html
      - All .js files from assets/
      - All .css files from assets/
      - Any image files from assets/

3. Configure Apache/cPanel:
   - Set document root to your frontend files
   - Ensure `.htaccess` handles client-side routing
   - Point API requests to Django backend

## Verify Deployment

1. Check frontend at: https://www.rentmyvenue.com
2. Verify API at: https://www.rentmyvenue.com/api
3. Test login and other features
4. Monitor error logs in cPanel

## Common Issues

1. Database Connection:
   - Verify database name includes cPanel username prefix
   - Check user privileges in phpMyAdmin
   - Test connection using phpMyAdmin

2. Static/Media Files:
   - Ensure paths are correct in settings_prod.py
   - Check file permissions
   - Verify static files are served correctly

3. API Errors:
   - Check Django error logs
   - Verify environment variables
   - Test API endpoints using Postman

Need help? Check cPanel's error logs or phpMyAdmin for detailed error messages.
