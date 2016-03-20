<?php

require 'config.php';

if (!empty($_GET['freedit'])) {

	$editorsData = DB::dotazVsechny('SELECT UNIX_TIMESTAMP(datetime) as time, state, nick, comment FROM ' . $dbPrefix . 'editors_insert WHERE freedit_id = ? ORDER BY datetime', array($_GET['freedit']));
	$controlorsData = DB::dotazVsechny('SELECT UNIX_TIMESTAMP(datetime) as time, state, nick, comment FROM ' . $dbPrefix . 'controlors_insert WHERE freedit_id = ? ORDER BY datetime', array($_GET['freedit']));

	$editorsDataParse = array();
	$controlorsDataParse = array();
	$i = 0;

	foreach ($editorsData as $v) {
		$editorsDataParse[$i]['nick'] = $v['nick'];
		$editorsDataParse[$i]['state'] = $v['state'];
		$editorsDataParse[$i]['comment'] = $v['comment'];
		$editorsDataParse[$i]['time'] = $v['time'];
		$editorsDataParse[$i]['date'] = Date('d.m.Y H:i:s', $v['time']);
		$i++;
	}

	$i = 0;

	foreach ($controlorsData as $v) {
		$controlorsDataParse[$i]['nick'] = $v['nick'];
		$controlorsDataParse[$i]['state'] = $v['state'];
		$controlorsDataParse[$i]['comment'] = $v['comment'];
		$controlorsDataParse[$i]['time'] = $v['time'];
		$controlorsDataParse[$i]['date'] = Date('d.m.Y H:i:s', $v['time']);
		$i++;
	}

	$returnData = array();

	if (count($controlorsDataParse) > 0) {
		$controlorsDataPosition = 0;
		$editorsDataPosition = 0;
		$returnData['msgs'] = array();
		$maxMsg = count($editorsDataParse) + count($controlorsDataParse);

		do {
			$ve = $editorsDataParse[$editorsDataPosition];
			$vc = $controlorsDataParse[$controlorsDataPosition];

			if (empty($vc)) {
				$returnData['msgs'][] = $ve;
				$editorsDataPosition++;
			}
			elseif (empty($ve) || $vc['time'] < $ve['time']) {
				$returnData['msgs'][] = $vc;
				$controlorsDataPosition++;
			}
			else {
				$returnData['msgs'][] = $ve;
				$editorsDataPosition++;
			}

		} while (($controlorsDataPosition + $editorsDataPosition) < $maxMsg);
	}
	else {
		$returnData['msgs'] = $editorsDataParse;
	}

	$returnData['actualState'] = $editorsDataParse[(count($editorsDataParse) - 1)]['state'];

	echo json_encode($returnData);
}