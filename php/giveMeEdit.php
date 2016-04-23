<?php

require 'config.php';

$freedit = isset($_GET['freedit'])?$_GET['freedit']:'';
$editor = isset($_GET['editor'])?$_GET['editor']:'';
$state = isset($_GET['state'])?$_GET['state']:'';
$comment = isset($_GET['comment'])?$_GET['comment']:'';

if (empty($freedit) || empty($editor)) {
	echo json_encode(array('error' => 1));
	exit;
}
else {
	if ($state == 'solved') {
		$state = 2;
	}
	elseif ($state == '') {
		$state = $_GET['actualState'];
	}

	//	add freedit to DB
	$data = array(
		'freedit_id' => $freedit,
		'datetime' => Date('Y-m-d H:i:s'),
		'nick' => $editor,
		'state' => $state,
		'comment' => $comment,
		'ip' => $ip
	);

	if (DB::vloz($dbPrefix . 'editors_insert', $data)) {
		if ($state == 1) {
			echo json_encode(array('error' => 0, 'state' => $state));
		}
		elseif ($state == 2) {
			echo json_encode(array('error' => 0, 'state' => $state));
		}
		else {
			echo json_encode(array('error' => 0));
		}
		exit;
	}
	else {
		echo json_encode(array('error' => 2));
		exit;
	}
}