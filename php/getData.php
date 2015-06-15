<?php

require 'config.php';

$country = isset($_GET['country'])?$_GET['country']:'cs';

$freeditData = DB::dotazVsechny('SELECT *, UNIX_TIMESTAMP(f.date) as time FROM freedit as f WHERE state = ? AND archive = ?', array($country, 0));
$editorsData = DB::dotazVsechny('SELECT ei1.freedit_id, ei1.datetime, ei1.nick, ei1.state, ei1.comment, UNIX_TIMESTAMP(ei1.datetime) as time FROM editors_insert ei1 LEFT JOIN editors_insert ei2 ON (ei1.freedit_id = ei2.freedit_id AND ei1.id < ei2.id) WHERE ei2.id IS NULL');
$controlorsData = DB::dotazVsechny('SELECT ci1.freedit_id, ci1.datetime, ci1.nick, ci1.state, ci1.comment, UNIX_TIMESTAMP(ci1.datetime) as time FROM controlors_insert ci1 LEFT JOIN controlors_insert ci2 ON (ci1.freedit_id = ci2.freedit_id AND ci1.id < ci2.id) WHERE ci2.id IS NULL');

$editorsDataParse = array();
$controlorsDataParse = array();

foreach ($editorsData as $v) {
	$editorsDataParse[$v['freedit_id']] = $v;
}
foreach ($controlorsData as $v) {
	$controlorsDataParse[$v['freedit_id']] = $v;
}

$returnData = array();

foreach ($freeditData as $k => $v) {
	$returnData[$k] = array(
		'id' => $v['id'],
		'time' => $v['time'],
		'name' => $v['name'],
		'district' => $v['district'],
		'region' => $v['region'],
		'added_by' => $v['added_by'],
		'lon' => $v['lon'],
		'lat' => $v['lat'],
		'zoom' => $v['zoom'],
		'attrs' => getAttributesAsText($v['attr_g'], $v['attr_k'], $v['attr_o'], $v['attr_n'], $v['attr_a']),
		'shape' => $v['shape'],
		'state' => returnActualFreeditState($editorsDataParse[$v['id']], $controlorsDataParse[$v['id']]),
		'editor' => $editorsDataParse[$v['id']]['nick'],
		// 'editortime' => $editorsDataParse[$v['id']]['time'],
		// 'controlortime' => $controlorsDataParse[$v['id']]['time'],
		'deadline' => returnDadline($v['time'], $deadlineLimit),
		'comment' => $controlorsDataParse[$v['id']]['comment']
	);
}

echo json_encode($returnData);