<?php
$servername = "45.55.136.114"; // Your database server name
$username = "PWW_F202"; // Your database user name which you use to connect
$password = "csc4350Time"; // Your database password

// Create connection
$db = mysqli_connect($servername, $username, $password);

// Check connection
if (!$db) {
    die("Connection failed: " . mysqli_connect_error());
}
echo "Connected successfully";
?>