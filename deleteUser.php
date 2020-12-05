<?php

include "dbconnect.php"; // Using database connection file here

$id = $_GET['id']; // get id through query string

$del = mysqli_query("delete from Users where id = '$id'"); // delete query

if($del)
{
    echo "User Deleted";
}
else
{
    echo "Error deleting record"; // display error message if not delete
}
?>