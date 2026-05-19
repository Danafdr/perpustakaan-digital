# Perpustakaan Digital (Digital Library)

A modern, full-stack digital library management system built with **Laravel** (Backend) and **React/Inertia.js** (Frontend). 

## 📋 System Requirements
Before running this project, ensure you have the following installed on your system:
- **PHP** (>= 8.1)
- **Composer** (PHP dependency manager)
- **Node.js & npm** (Frontend asset bundler)
- **MySQL/MariaDB** (Database)

---

## 🚀 Getting Started

You can run this project using either a local web server stack (like XAMPP/Laragon) or via Docker (using Laravel Sail). Choose the method that best fits your workflow.

### Option 1: Using XAMPP / Laragon (Recommended for Windows)

This is the standard approach for local PHP development on Windows.

1. **Clone the repository** (if you haven't already) into your `htdocs` (XAMPP) or `www` (Laragon) folder:
   ```bash
   git clone https://github.com/Danafdr/perpustakaan-digital.git
   cd perpustakaan-digital
   ```
2. **Install PHP Dependencies**:
   ```bash
   composer install
   ```
3. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```
4. **Environment Setup**:
   Copy the example environment file and generate your application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. **Database Configuration**:
   - Open your XAMPP Control Panel or Laragon and start **Apache** and **MySQL**.
   - Open your database GUI (phpMyAdmin, HeidiSQL, etc.) and create a new empty database named `perpustakaan_digital`.
   - Ensure your `.env` file matches your local credentials (default XAMPP/Laragon user is usually `root` with no password):
     ```env
     DB_DATABASE=perpustakaan_digital
     DB_USERNAME=root
     DB_PASSWORD=
     ```
6. **Run Migrations & Seed the Database**:
   ```bash
   php artisan migrate:fresh --seed
   ```
7. **Start the Application**:
   You need to run two processes simultaneously in two separate terminal windows:
   - **Terminal 1 (Backend Server)**: `php artisan serve`
   - **Terminal 2 (Frontend Bundler)**: `npm run dev`

Visit `http://localhost:8000` or your configured custom domain in your browser!

---

### Option 2: Using Docker (Laravel Sail)

If you prefer a containerized environment without installing PHP/MySQL directly on your machine, you can use Docker.

1. **Install Docker Desktop** and make sure it is running.
2. **Install PHP Dependencies**: 
   *(Note: If you don't have PHP locally, you can use a small Docker container to install vendor dependencies first as per Laravel's official docs, or run `composer install` locally if you have PHP).*
3. **Copy `.env` file**:
   ```bash
   cp .env.example .env
   ```
4. **Start the Sail Containers**:
   ```bash
   ./vendor/bin/sail up -d
   ```
5. **Run Setup Commands Inside Docker**:
   ```bash
   ./vendor/bin/sail artisan key:generate
   ./vendor/bin/sail artisan migrate:fresh --seed
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run dev
   ```

Your app will be available at `http://localhost`.

---

## 🛠️ Essential Laravel Commands

When exploring or modifying the code, you will frequently use these `php artisan` commands:

| Command | Description |
|---------|-------------|
| `php artisan serve` | Starts the local PHP development server at localhost:8000. |
| `php artisan migrate` | Runs any pending database migrations (creates your tables). |
| `php artisan migrate:fresh` | **Destructive!** Drops all tables and re-runs all migrations from scratch. |
| `php artisan migrate:fresh --seed` | Drops all tables, re-migrates, and populates the database with dummy/initial data. |
| `php artisan make:model Book -m` | Creates a new Model (`Book`) and a Migration file (`-m`) for it. |
| `php artisan make:controller BookController` | Creates a new HTTP Controller to handle logic. |
| `php artisan route:list` | Displays a list of all registered routes and their endpoints. |
| `php artisan optimize:clear` | Clears all cached configurations, routes, and views if your app acts weirdly. |

## 📚 Code Architecture Guide

- **Frontend (`/resources/js`)**: Built with React and TypeScript. We use Inertia.js to seamlessly connect React components to Laravel routes without needing a traditional REST API. 
- **Backend (`/app/Http/Controllers`)**: Contains the business logic. Look at `AdminController.php` for library management logic.
- **Routes (`/routes/web.php`)**: Where URLs are mapped to Controller functions.
- **Database (`/database/migrations`)**: Where the structure of your SQL tables is defined.
