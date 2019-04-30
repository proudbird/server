const _ = require('lodash');

UIElement.update = function (item, directive) {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: directive,
      elementId: UIElement.config.id,
      arguments: [item.toJSON()]
    }

    const client = Application.window._.client;
    Log.debug(`Window ID: ${client.windowId}`);
    client.emit("directive", message, function(response) {
      if (response.err) {
        reject(response.err);
      } else {
        resolve(response.result);
      }
    })
  });
}

UIElement.getSelected = function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "getSelectedItem",
      elementId: UIElement.config.id,
      arguments: [true]
    }

    const client = Application.window._.client;
    Log.debug(`Window ID: ${client.windowId}`);
    client.emit("directive", message, async function(response) {
      if (response.err) {
        reject(response.err);
      } else {
        const selectors = _.map(response.result, 'id');
        let result = await _getItems(UIElement, selectors);
        if(result === undefined) {
          result = response.result;
        }
        resolve(result);
      }
    })
  });
}

UIElement.openAll = function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "openAll",
      elementId: UIElement.config.id,
      arguments: []
    }

    const client = Application.window._.client;
    Log.debug(`Window ID: ${client.windowId}`);
    client.emit("directive", message, function(response) {
      if (response.err) {
        reject(response.err);
      } else {
        resolve(null)
      }
    })
  });
}

async function _getItems(view, selectors) {

  const from = _.cloneDeep(view.config.query.FROM);
  const options = {
    where: {
      id: {
        [_.QO.in]: selectors
      }
    }
  };

  const type = _.get(Application, from);
  if(type) {
    return await type.select(options);
  } else {
    return undefined;
  }
}

UIElement.SetFilter = function (filters, callback) {
  let queryOptions = UIElement.View.dataSchema.queryOptions;
  if (!queryOptions) {
    queryOptions = {};
    queryOptions.where = {};
  }
  if (!queryOptions.where) {
    queryOptions.where = {};
  }

  filters.forEach(function (item, i, filters) {
    queryOptions.where[item.attribute] = item.value;
  });

  UIElement.Refresh();
}

UIElement.Search = function (filters, callback) {
  let queryOptions = UIElement.View.dataSchema.queryOptions;
  if (!queryOptions) {
    queryOptions = {};
    queryOptions.where = {};
  }
  if (!queryOptions.where) {
    queryOptions.where = {};
  }

  filters.forEach(function (item, i, filters) {
    queryOptions.where[item.attribute] = item.value;
  });

  UIElement.Refresh();
}

UIElement.defineContextMenu = function (itemId, config, callback) {

  var menu = {
    view: "ContextMenu",
    formID: UIElement.View.formID,
    id: UIElement.View.formID + "_context",
    data: config
  };

  var Message = {};
  Message.Directive = 'defineContextMenu';
  Message.ViewID = UIElement.View.id;
  Message.item = itemId;
  Message.Value = menu;
  Form.Client.emit('message', Message, function (Response) {
    if (callback) callback(Response);
  });
}