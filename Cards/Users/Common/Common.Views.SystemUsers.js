View.onLoad = async function() {
  
}

View.sysUserList = async function() {
  return await Application.getUsers();
}

View.List_onItemDblClick = async function() {
  const selected = await View.List.getSelected();
  if(View.options.purpose === "select") {
    View.close(selected[0]);
  }
}