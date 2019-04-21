<?php

require_once('config.php');

$trips_id = $_GET['trips_id'];

if (empty($trips_id)) {
    throw new Exception('Please provide trips_id (int) with your request');
}

$query = "SELECT *
    FROM `budget`
    WHERE `trips_id` = ?
    ORDER BY `added` DESC
";

$statement = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($statement, 'd', $trips_id);
mysqli_stmt_execute($statement);

$result = mysqli_stmt_get_result($statement);

if (!$result) {
    throw new Exception(mysqli_error($conn));
}

if (mysqli_num_rows($result) === 0) {
    $output['success'] = true;
    $output['budget'] = 'No budget items yet';
    print(json_encode($output));
    exit();
}

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = [
        'budget_id' => $row['id'],
        'description' => $row['description'],
        'category' => $row['category'],
        'price' => $row['price'],
    ];
}

$output['success'] = true;
$output['budget'] = $data;

print(json_encode($output));

?>
