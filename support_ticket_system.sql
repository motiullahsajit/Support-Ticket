-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 12, 2025 at 06:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `support_ticket_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','resolved','closed') DEFAULT 'open',
  `customer_id` int(11) NOT NULL,
  `executive_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `subject`, `description`, `status`, `customer_id`, `executive_id`, `created_at`, `updated_at`) VALUES
(1, 'Website Login Issue', 'Unable to log in after resetting the password.', 'open', 3, NULL, '2025-02-12 16:50:39', '2025-02-12 16:50:39'),
(2, 'Payment Processing Error', 'Transaction failed during checkout.', 'open', 3, NULL, '2025-02-12 16:50:50', '2025-02-12 16:50:50'),
(3, 'Bug in Dashboard', 'Dashboard is not updating real-time stats.', 'open', 3, 2, '2025-02-12 16:51:02', '2025-02-12 17:03:05'),
(4, 'Mobile App Crash', 'App crashes when opening the settings page', 'open', 3, NULL, '2025-02-12 16:51:13', '2025-02-12 17:03:02'),
(5, 'Feature Request: Dark Mode', 'Request to add a dark mode option in the settings.', 'open', 3, 2, '2025-02-12 16:51:25', '2025-02-12 17:02:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `role` enum('user','executive','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `image_url`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin', 'admin@gmail.com', '$2a$10$bOxaALIuN96LiLVnggsPveOvHncMzfXgEml6zIjUB27K1FU6Muh9.', 'https://i.ibb.co.com/ns7pMs2V/avatar.jpg', 'admin', '2025-02-12 16:47:28', '2025-02-12 16:52:02'),
(2, 'Executive', 'executive', 'executive@gmail.com', '$2a$10$IyIZlw8TTVjpY7L/AHtgUOz04Zm3kRUqBd/KIeOvTMUW0JdbDUZuK', 'https://i.ibb.co.com/ns7pMs2V/avatar.jpg', 'executive', '2025-02-12 16:48:13', '2025-02-12 16:52:23'),
(3, 'User', 'user', 'user@gmail.com', '$2a$10$HL4ttNbZDe1U0jvvkA3dXet.eQjkcVDpiParKX0Kqona0h248OYi2', 'https://i.ibb.co.com/ns7pMs2V/avatar.jpg', 'user', '2025-02-12 16:48:49', '2025-02-12 16:48:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `executive_id` (`executive_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`executive_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
