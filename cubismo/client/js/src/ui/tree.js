webix.protoUI({
  name: "Tree",
  defaults: {
    scroll: true,
    on: {
      onItemDblClick: function (id, e) {
        if (id) {
          if(this.config.events && this.config.events.onItemDblClick) {
            const event = this.config.events.onItemDblClick;
            callServer("event", {
              viewId: this.config.viewId,
              element: this.config.name,
              event: event,
              owner: this.config.owner,
              arguments: [id]
            });
          }
        }
        return true;
      },
      onBeforeEditStop: function (state, editor) {
        const self = this;
        if(this.config.events && this.config.events.onBeforeEditStop) {
          const item = this.getItem(editor.id);
          const event = this.config.events.onBeforeEditStop;
          callServer("event", {
            viewId: this.config.viewId,
            element: this.config.name,
            event: event,
            owner: this.config.owner,
            arguments: [item, state.value, state.old]
          }, (result) => {
            self.getItem(editor.id)[self.config.editValue] = result ? state.value : state.old;
            self.refresh(editor.id);
            return state;
          });
        }
        return true;
      }
    }
  },
  $init: function (config) {
    this.$ready.push(this._Init);
    this.$ready.unshift(this._after_init_call);

    const self = this;
    // config.type = {
    //   folder: function (obj, type) {
    //     if(!self || !self.isBranchOpen) {
    //       return;
    //     }
    //     const collapsed = self.isBranchOpen(obj.id);
    //     if (obj.isFolder) {
    //       if (collapsed) {
    //         return "<span class='fa-icon fa-folder-open'>&nbsp;</span>";
    //       } else {
    //         return "<span class='fa-icon fa-folder'>&nbsp;</span>";
    //       }
    //     } else {
    //       let hasChildes = false;
    //       if(self.getFirstChildId) {
    //         hasChildes = !!self.getFirstChildId(obj.id);
    //       }
    //       if(hasChildes) {
    //         return "<span class='fa-icon fa-equals'>&nbsp;</span>";
    //       } else {
    //         return "<span class='fa-icon fa-minus'>&nbsp;</span>";
    //       }
    //     }
    //   }
    // }
  },
  _after_init_call: function () {

  },
  _Init: function () {
    this.getData();
  },
  getData: function () {
    const self = this;
    callServer("getData", {
      viewId: this.config.viewId,
      element: this.config.name
    }, function (err, data) {
      if (err) {
        return console.log("Error on getting data from server");
      }
      self.parse(data);
      callServer("event", {
        viewId: self.config.viewId,
        element: self.config.name,
        event: "DefaultCmd.OnAfterLoad",
        arguments: []
      });
    });
  }
}, webix.EditAbility, webix.ui.tree);