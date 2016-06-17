<?php

require 'config.php';

$freedit = isset($_GET['freedit'])?$_GET['freedit']:'';
$editor = isset($_GET['editor'])?$_GET['editor']:'';
$state = isset($_GET['state'])?$_GET['state']:'';
$comment = isset($_GET['comment'])?$_GET['comment']:'';
$key = isset($_GET['key'])?$_GET['key']:'';

if ($controllorsKeys[$editor] == $key) {
	if (empty($freedit) || empty($editor) || empty($state)) {
		echo json_encode(array('error' => 1));
		exit;
	}
	else {
		//	add freedit to DB
		$data = array(
			'freedit_id' => $freedit,
			'datetime' => Date('Y-m-d H:i:s'),
			'nick' => $editor,
			'state' => $state,
			'comment' => nl2br($comment),
			'ip' => $ip
		);

		if (DB::vloz($dbPrefix . 'controlors_insert', $data)) {
			echo json_encode(array('error' => 0, 'state' => $state));
			exit;
		}
		else {
			echo json_encode(array('error' => 2));
			exit;
		}
	}
}