# Setting up MySQL Database on cPanel for RentMyVenue Django App

This guide helps you set up a MySQL database on cPanel and configure your Django app to use it in production.

## Step 1: Create MySQL Database and User on cPanel

1. Log in to your cPanel dashboard.
2. Navigate to **Databases > MySQL Databases**.
3. Under **Create New Database**, enter a database name (e.g., rentmyvenue_db) and click **Create Database**.
4. Scroll down to **MySQL Users** section.
5. Create a new user with a username and strong password.
6. Add the user to the database you created.
7. Assign **All Privileges** to the user for that database.
8. Note down the database name, username, password, and hostname (usually `localhost`).

## Step 2: Update Django Production Environment Variables

Set the following environment variables on your production server or in your `.env` file:

```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306
```

## Step 3: Install MySQL Client Library

Ensure your production environment has the MySQL client library installed:

```bash
pip install mysqlclient
```

If you face issues installing `mysqlclient`, you can use `PyMySQL` as a pure Python alternative.

## Step 4: Run Django Migrations

After configuring the database, run migrations to create tables:

```bash
python manage.py migrate --settings=config.settings_prod
```

## Step 5: Collect Static Files

Collect static files for production:

```bash
python manage.py collectstatic --settings=config.settings_prod
```

## Step 6: Restart Your Application Server

Restart your web server or application server (e.g., Gunicorn, uWSGI) to apply changes.

---

If you need help with any of these steps, please let me know.
