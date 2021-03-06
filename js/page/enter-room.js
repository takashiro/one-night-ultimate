
DeclareModule('page/enter-room', ()=>{
	let root = $('#root');
	root.html('');

	let room_box = $('<div id="room-box" class="inline-message"></div>');
	room_box.html(`Invite your friends into Room No.<span id="room-id">${$room.id}</span>!`);
	root.append(room_box);

	let role_box = $('<div id="role-box" class="box"><h3>Roles</h3></div>');
	let role_list = $('<ul class="role-list"><ul>');
	role_box.append(role_list);
	root.append(role_box);

	role_list.on('update-role', () => {
		role_list.html('');
		$room.roles.forEach(role => {
			let li = $(`<li></li>`);
			li.append(PlayerRole.createImage(role));
			role_list.append(li);
		});
	});
	role_list.trigger('update-role');

	let extra_card_box = $('<div id="extra-card-box" class="box" style="display: none"><h3>Extra Cards</h3></div>');
	let extra_card_list = $('<ul class="role-list" id="extra-card-list"></ul>');
	extra_card_list.on('update-card', () => {
		extra_card_list.html('');
		for (let i = 0; i < $room.extra_card_num; i++) {
			let card = $('<li><div class="role background"></div></li>');
			extra_card_list.append(card);
		}
	});
	extra_card_box.append(extra_card_list);
	root.append(extra_card_box);

	let online_box = $('<div class="box"><h3>Players</h3></div>');
	let online_list = $('<ul id="player-list" class="player-list"></ul>');
	online_box.append(online_list);
	root.append(online_box);

	let button_area = $('<div id="button-area" class="button-area"></div>');

	let return_button = $('<button type="button">RETURN</button>');
	button_area.append(return_button);
	return_button.click(() => {
		if ($client.connected) {
			$client.request(net.EnterRoom);
			LoadPage('enter-lobby');
		} else {
			LoadPage('login');
		}
	});

	let start_button = $('<button class="owner-button" type="button">START</button>');
	if ($room.owner.id != $user.id) {
		start_button.hide();
	}
	start_button.click(() => {
		if ($room.players.length + $room.extra_card_num <= $room.roles.length) {
			$client.request(net.StartGame);
		} else {
			let player_num = $room.roles.length - $room.extra_card_num;
			let s = player_num > 1 ? 's' : '';
			MakeToast(`The room is only capable of ${player_num} player${s}`);
		}
	});
	button_area.append(start_button);

	root.append(button_area);

	let addPlayer = player => {
		let li = $('<li></li>');

		li.data('uid', player.id);

		let nickname = $('<div></div>');
		nickname.addClass('nickname');
		nickname.text(player.name ? player.name : player.id);
		li.append(nickname);

		let role_text = $('<div></div>');
		role_text.addClass('role-text');
		role_text.html('?');
		li.append(role_text);

		online_list.append(li);
	}
	$room.players.push($user);
	$room.players.forEach(addPlayer);
	online_list.on('add-player', (e, player) => addPlayer(player));

	online_list.on('remove-player', (e, uid) => {
		online_list.children().each(function(){
			let li = $(this);
			if(li.data('uid') == uid){
				li.remove();
				return false;
			}
			return true;
		});
	});

	online_list.on('update-player', (e, info) => {
		online_list.children().each(function(){
			let user = $(this);
			if(user.data('uid') != info.id){
				return true;
			}

			if(info.name){
				let nickname = user.children('.nickname');
				nickname.text(info.name);
			}

			return false;
		});
	});
});
