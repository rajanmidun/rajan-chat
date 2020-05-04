const socket = io();
const chatMessageDiv = document.querySelector(".chat-messages");

//get the username and room
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

//send the join message to the server
socket.emit('joinMessage', { username, room });

//for the chat
$("#send-button").on('click', (e) => {
  e.preventDefault();

  const mesg = $("#msg").val();
  if (mesg != "") {
    //sending the message
    const message = {
      username,
      message: mesg
    }
    socket.emit('message', message);

    //clear the input field
    $("#msg").val("");
    $("#msg").focus();
  }
})

//listen to the message
socket.on('message', message => {
  const chatMessage = document.querySelector('.chat-messages');
  const div = document.createElement('div');
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
  ${message.message}
  </p>`
  chatMessage.appendChild(div);

  //scroll to the bottom
  chatMessageDiv.scrollTop = chatMessageDiv.scrollHeight;
})

// for the user list for particular room
socket.on('users', ({ room, users }) => {
  document.getElementById("room-name").innerHTML = room;
  const userList = document.getElementById('users');
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
})