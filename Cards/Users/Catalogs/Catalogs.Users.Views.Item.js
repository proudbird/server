let savedSysUser;

View.onLoad = function () {
  savedSysUser = Item.Username;
  if(Item.isNew()) {
    clearUsername();
  }
  clearPassword(true);
}

View.beforeSave = async function() {

  function checkPasswords() {

    if(Variables.password != Variables.repeatPassword) {
      Application.alert("Passwords don't match!");
      return false;
    } else {
      return true;
    }
  }

  if(savedSysUser && savedSysUser != Item.Username) {
    const result = await Application.ask("Are you shure that you want to change system username?", ["Yes", "No"]);
    if(result === "No") {
      return false;
    }
  }

  if(!savedSysUser && Item.Username) { // create new system user
    const users = await Application.getUsers();
    if(_.find(users, ["username", Item.Username])) {
      Application.alert(`System user with username <${Item.Username}> allready exists!`);
      return false;
    }
    if(checkPasswords()) {
      try {
        await Application.createUser(Item.Username, Variables.password);
      } catch(err) {
        Log.error(`Unsuccessful attempt to create new system user with username <${Item.username}>`, err);
      }
    } else {
      return false;
    }
  } else if(Variables.password || Variables.repeatPassword) {
    if(checkPasswords()) {
      return await Application.updateUserPassword(Item.Username, Variables.password);
    } else {
      return false;
    }
  }

  Item.Name = [Item.FirstName, Item.LastName].join(" ");

  return true;
}

View.UserName_onLookup = async function(value) {

  const options = {
    purpose: "select",
    caller: View
  }

  const result = await Application.Users.Common.Views("SystemUsers").show({ options });
  Item.Username = result.username;
  clearPassword();
}

function clearPassword(focusFirstName) {
  // this is needed because of Chrome wish to fill saved password
  setTimeout(function() {
    Variables.password = "";
    if(focusFirstName) {
      View.FirstName.focus();
    }
  }, 500);
}

function clearUsername() {
  // this is needed because of Chrome wish to fill saved password
  setTimeout(function() {
    Item.Username = "";
  }, 500);
}
