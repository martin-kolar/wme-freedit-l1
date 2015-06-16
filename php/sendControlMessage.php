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

		if (DB::vloz('controlors_insert', $data)) {
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
			<td data-fe-translate="control-message-freedit-number"></td>
			<td><input type="text" name="freedit" value="<?=$freedit?>" /></td>
		</tr>
		<tr>
			<td data-fe-translate="control-message-editor"></td>
			<td><input type="hidden" name="editor" value="<?=$editor?>" /><?=$editor?></td>
		</tr>
		<tr>
			<td data-fe-translate="control-message-state"></td>
			<td>
				<input type="radio" name="state" value="3" id="control-freedit-state-3"<? if ($state == 3) echo ' checked="checked"'; ?> /><label for="control-freedit-state-3" data-fe-translate="control-message-state-3"></label><br/>
				<input type="radio" name="state" value="4" id="control-freedit-state-4"<? if ($state == 4) echo ' checked="checked"'; ?> /><label for="control-freedit-state-4" data-fe-translate="control-message-state-4"></label>
			</td>
		</tr>
		<tr>
			<td data-fe-translate="control-message-comment"></td>
			<td><textarea name="comment"><?=$comment?></textarea></td>
		</tr>
		<tr>
			<td>&nbsp;</td>
			<td><input type="hidden" name="add" value="1" /><button type="submit" name="add" value="1" data-fe-translate="register-editing-freedit-number"></button><button type="button" name="" class="fe-close-modal-window" data-fe-translate="modal-window-close">Zavřít</button></td>
		</tr>
	</table>
</form>