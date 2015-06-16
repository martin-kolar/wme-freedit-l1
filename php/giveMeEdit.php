<?php

require 'config.php';

$freedit = isset($_GET['freedit'])?$_GET['freedit']:(isset($_POST['freedit'])?$_POST['freedit']:null);
$editor = isset($_GET['editor'])?$_GET['editor']:(isset($_POST['editor'])?$_POST['editor']:null);
$state = isset($_GET['state'])?$_GET['state']:(isset($_POST['state'])?$_POST['state']:1);
$comment = isset($_GET['comment'])?$_GET['comment']:(isset($_POST['comment'])?$_POST['comment']:null);
$add = isset($_POST['add'])?true:false;

if ($add) {
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
			'comment' => $comment,
			'ip' => $ip
		);

		if (DB::vloz('editors_insert', $data)) {
			echo json_encode(array('error' => 0));
			exit;
		}
		else {
			echo json_encode(array('error' => 2));
			exit;
		}
	}
}

?>
<form id="register-freedit" method="post" action="<?=$url?>giveMeEdit.php">
	<table>
		<tr>
			<td data-fe-translate="register-editing-freedit-number"></td>
			<td><input type="text" name="freedit" value="<?=$freedit?>" /></td>
		</tr>
		<tr>
			<td data-fe-translate="register-editing-editor"></td>
			<td><input type="hidden" name="editor" value="<?=$editor?>" /><?=$editor?></td>
		</tr>
		<tr>
			<td data-fe-translate="register-editing-state"></td>
			<td><input type="hidden" name="state" value="<?=$state?>" /><span data-fe-translate="register-editing-freedit-state-<?=$state?>"></span></td>
		</tr>
		<tr>
			<td data-fe-translate="register-editing-comment"></td>
			<td><textarea name="comment"><?=$comment?></textarea></td>
		</tr>
		<tr>
			<td>&nbsp;</td>
			<td><input type="hidden" name="add" value="1" /><button type="submit" name="add" value="1" data-fe-translate="register-editing-button"></button><button type="button" name="" class="fe-close-modal-window" data-fe-translate="modal-window-close"></button></td>
		</tr>
	</table>
</form>