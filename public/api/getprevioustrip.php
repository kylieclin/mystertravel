<?php

ob_start(null, 0, PHP_OUTPUT_HANDLER_CLEANABLE ^ PHP_OUTPUT_HANDLER_REMOVABLE);
require_once('checkloggedin.php');
ob_end_clean();

$output = [
    'success' => false
];

require_once('config.php');

if (!empty($_SESSION['user_data']['users_id'])) {
    $users_id = intval($_SESSION['user_data']['users_id']);
}

if (empty($users_id)) {
    throw new Exception('User does not exist');
}

$query = "SELECT *
    FROM `trips`
    WHERE `users_id` = $users_id
    AND NOT `end` IS NULL
";

$result = mysqli_query($conn, $query);

if(!$result){
    throw new Exception(mysqli_error($conn));
}

if(mysqli_num_rows($result) === 0){
    $output['success'] = true;
    $output['data'] = [];
    print(json_encode($output));
    exit();
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $start = date("m/d/Y H:i:s", strtotime($row['start']));
    $end = date("m/d/Y H:i:s", strtotime($row['end']));
    $data[] = [
        'trips_id' => $row['id'],
        'trips_name' => $row['trips_name'],
        'start' => $start,
        'end' => $end,
    ];
};

$output['success'] = true;
$output['data'] = $data;

print(json_encode($output));

?>
