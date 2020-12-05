<?php
function OpenCon()
 {
 $dbhost = "45.55.136.114";
 $dbuser = "PWW_F202";
 $dbpass = "csc4350Time";
 $db = "PWW_F202";
 $conn = new mysqli($dbhost, $dbuser, $dbpass,$db) or die("Connect failed: %s\n". $conn -> error);
 
 return $conn;
 }
 
function CloseCon($conn)
 {
 $conn -> close();
 }
   
?>