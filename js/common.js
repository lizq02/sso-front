Base = new Object();

/**
 * 1.异步提交表单，action必须返回JSON或者null，此方法不能用于页面跳转，通常用于返回表格数据。
 * 2.能够自动校验表单
 * 3.能够对后台返回的json进行自动处理。
 * @param submitIds 需要传递到后台的对象id或容器id,多个id可以用","隔开
 * @param url 提交的地址
 * @param parameter 入参 json格式对象
 * @param onSubmit 提交前手动检查，如果返回false将不再提交,必须返回true或false
 * @param successCallback callback 返回业务成功后的回调，入参返回的为json对象和XMLHttpRequest对象
 *                     例如：function(data){alert(data.lists)}，其中data为返回的json数据
 * @param failCallback 业务失败回调，入参返回的为json对象和XMLHttpRequest对象
 * @param async (默认: true) 默认设置下，所有请求均为异步请求。
 *              如果需要发送同步请求，请将此选项设置为 false。注意，同步请求将锁住浏览器，用户其它操作必须等待请求完成才可以执行。
 * @param type (默认: "POST") 请求方式 ("POST" 或 "GET")， 默认为 "POST"。
 */
Base.submit = function (submitIds, url, parameter, onSubmit, successCallback, failCallback, async, type) {
    // 参数校验
    submitIds = (submitIds == null) ? "" : submitIds;
    url = (url == null) ? "" : url;
    parameter = (parameter == null || parameter.length == 0) ? {} : parameter;
    onSubmit = (onSubmit == null) ? function () {
        return true;
    } : onSubmit;
    async = (async != true) ? true : false;
    type = (type == null) ? "" : type;
    type = (type.toUpperCase() === "GET") ? "GET" : "POST";
    // 设置函数默认参数
    var settings = {
        submitIds: "",
        url: "",
        type: type,
        parameter: {},
        onSubmit: function () {
            return true;
        },
        async: true,
        timeout: 10000,/*设置请求超时时间，毫秒*/
        context: document.body,/*这个对象用于设置Ajax相关回调函数的上下文。
                                也就是说，让回调函数内this指向这个对象（如果不设定这个参数，
                                那么this就指向调用本次AJAX请求时传递的options参数）。*/
        successCallback: function (data, request) {
        },
        failCallback: function (data, request) {
            if (Base.isNotNull(data.msg)) {
                Base.alert(data.msg, "error", null)
            } else {
                Base.alert("服务器内部错误,请联系系统管理员!", "error", null)
            }
        }
    };
    var nowSettings = {
        submitIds: submitIds,
        url: url,
        parameter: parameter,
        onSubmit: onSubmit,
        async: async,
        successCallback: successCallback,
        failCallback: failCallback,
        type: type
    };
    if (parameter != null) {
        nowSettings.parameter = parameter;
    } else {
        nowSettings.parameter = {};
    }
    if (onSubmit != null) {
        nowSettings.onSubmit = onSubmit;
    } else {
        nowSettings.onSubmit = function () {
            return true;
        };
    }
    if (async != null) {
        nowSettings.async = async;
    } else {
        nowSettings.async = true;
    }
    if (successCallback != null) {
        nowSettings.successCallback = successCallback;
    } else {
        nowSettings.successCallback = function (data, request) {
        };
    }
    if (failCallback != null) {
        nowSettings.failCallback = failCallback;
    } else {
        nowSettings.failCallback = function (data, request) {
            if (Base.isNotNull(data.msg)) {
                Base.alert(data.msg, "error", null)
            } else {
                Base.alert("服务器内部错误,请联系系统管理员!", "error", null)
            }
        };
    }
    jQuery.extend(settings, nowSettings);
    if (settings.onSubmit() === false) {
        return false;
    }
    // 加载蒙层
    var loadingId = Base.showMask();
    var data = parameter;
    if (settings.submitIds != null && settings.submitIds.length > 0) {
        var formIds = settings.submitIds.trim().split(",");
        for (var i = 0, len = formIds.length; i < len; i++) {
            var form = document.getElementById(formIds[i]);
            var items = form.elements;
            for (var j = 0, num = items.length; j < num; j++) {
                var key = $(items[j]).attr("id") || $(items[j]).attr("name");
                if (key == null || key == undefined) {
                    continue;
                }
                data[key] = $(items[j]).val();
            }
        }
    }
    jQuery.ajax({
        url: settings.url,
        data: data,
        dataType: "json",
        type: settings.type,
        async: settings.async,
        timeout: settings.timeout,
        traditional: true,
        context: settings.context,
        /*由服务器返回，并根据dataType参数进行处理后的数据；描述状态的字符串。*/
        success: function (data, textStatus, XMLHttpRequest) {
            // data 可能是 xmlDoc, jsonObj, html, text, 等等...
            settings.successCallback(data, XMLHttpRequest);
            if (Base.isNotNull(data.code) && data.code != '0') {
                Base.alert(data.msg, "error", null);
            }
            Base.hideMask(loadingId);
        },
        /*XMLHttpRequest 对象、错误信息、（可选）捕获的异常对象。
        如果发生了错误，错误信息（第二个参数）除了得到null之外，还可能是"timeout", "error", "notmodified" 和 "parsererror"。*/
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status != 200) {
                settings.failCallback(data, XMLHttpRequest);
            }
            if (XMLHttpRequest.status != 302) {
                location.href = "/index.html";
            }
            Base.hideMask(loadingId);
        }
    });
}

/**
 * 异步提交表单：post请求
 * @param submitIds
 * @param url
 * @param parameter
 * @param onSubmit
 * @param successCallback
 * @param failCallback
 * @param async
 * @param type
 */
Base.submitPost = function (submitIds, url, parameter, onSubmit, successCallback, failCallback, async) {
    this.submit(submitIds, url, parameter, onSubmit, successCallback, failCallback, async, "POST");
}

/**
 * 异步提交表单：get请求
 * @param submitIds
 * @param url
 * @param parameter
 * @param onSubmit
 * @param successCallback
 * @param failCallback
 * @param async
 */
Base.submitGet = function (submitIds, url, parameter, onSubmit, successCallback, failCallback, async) {
    this.submit(submitIds, url, parameter, onSubmit, successCallback, failCallback, async, "GET");
}

/**
 * 在当前一个页面打开一个弹窗
 * @param id 窗口id
 * @param title 窗口标题（支持html格式字符串）
 * @param url url
 * @param parameter 参数（JSON格式，如{param1:'xxx',param2:'xxx'}）
 * @param width 窗口宽度
 * @param height 窗口高度
 * @param onClose 窗口关闭回调函数
 */
Base.openWindow = function (id, title, url, parameter, width, height, onClose) {
    // 获取当前窗口高度、宽度
    var documentHeight = $(document).height();
    var documentWidth = $(document).width();
    var windowHtmlStr = "<div id='" + id + "' class='tortoise-window-mc' closeFn='" + onClose + "' + style='height:" + documentHeight + "px;'>";
    width = (width || "400px") + "";
    height = (height || "400px") + "";
    var top;
    if (height.indexOf("%") > -1) {
        var h = (parseInt(documentHeight) * parseInt(height)) / 100;
        top = (parseInt(documentHeight) - parseInt(h)) / 2;
    } else {
        top = (parseInt(documentHeight) - parseInt(height)) / 2;
    }
    var left;
    if (width.indexOf("%") > -1) {
        var w = (parseInt(documentWidth) * parseInt(width)) / 100;
        left = (parseInt(documentWidth) - parseInt(w)) / 2;
    } else {
        left = (parseInt(documentWidth) - parseInt(width)) / 2;
    }
    if (!isNaN(width)) {
        width += "px";
    }
    if (!isNaN(height)) {
        height += "px";
    }
    var nodeId = id + "_" + new Date().getTime();
    windowHtmlStr += "<div class='tortoise-window-div' style='height: " + height + ";width: " + width + ";top:" + top + "px;left:" + left + "px'>";
    windowHtmlStr += "<div>" +
        "            <div class='pull-left tortoise-window-title'>" + title + "</div>" +
        "            <div class='pull-right tortoise-window-close' name='" + nodeId + "'></div>" +
        "            <div class='pull-right tortoise-window-maximize' name='" + nodeId + "' status='min' historyHeight='" + height + "' historyWidth='" + width +
        "'           historyTop='" + top + "' historyLeft='" + left + "' onclick='windowMaximizeOnclick(this)'></div>" +
        "        </div>";
    var src = url;
    if (parameter != undefined && parameter != null) {
        var index = 0;
        for (var key in parameter) {
            if (index === 0) {
                index++;
                src += "?" + key + "=" + parameter[key];
            } else {
                src += "&" + key + "=" + parameter[key];
            }
        }
    }
    windowHtmlStr += "<iframe src='" + src + "' width='100%' height='100%'" +
        "frameborder='0' scrolling='auto'></iframe>";
    windowHtmlStr += "</div>";
    windowHtmlStr += "</div>";
    $("body").append(windowHtmlStr);
    $("#" + id + " .tortoise-window-close").click(function () {
        onClose();
        windowCloseOnclick(this);
    });
}

// 窗口放大缩小按钮点击事件
function windowMaximizeOnclick(obj) {
    obj = $(obj);
    var name = obj.attr("name");
    var id = name.substring(0, name.lastIndexOf("_"));
    var status = obj.attr("status");
    var node = $("#" + id + " .tortoise-window-div");
    if (status == "min") {
        // 放大
        node.attr("style", "height:95%;width:100%;top:0px;left:0px;");
        obj.attr("status", "max");
    } else if (status == "max") {
        // 缩小
        $("#" + id + " .tortoise-window-div").attr("style",
            "height:" + obj.attr("historyHeight") + ";width:" + obj.attr("historyWidth") +
            ";top:" + obj.attr("historyTop") + "px;left:" + obj.attr("historyLeft") + "px;");
        obj.attr("status", "min");
    }
}

// 窗口关闭按钮点击事件
function windowCloseOnclick(obj) {
    var name = $(obj).attr("name");
    Base.closeWindow(name.substring(0, name.lastIndexOf("_")));
}

// 关闭窗口
Base.closeWindow = function (id) {
    var nodes = document.getElementById(id).childNodes[0].childNodes[0].childNodes;
    for (var index in nodes) {
        if (nodes[index].className != undefined && nodes[index].className == "pull-right tortoise-window-close") {
            nodes[index].click();
        }
    }
    document.getElementsByTagName("BODY").item(0).removeChild(document.getElementById(id));
}

/**
 * 下拉树初始化方法
 * 如：<div id="selectTest"></div>
 * @param params selectInit({id: "selectTest", isOpen: true, rootValue: "0", keyId: "id", keyValue: "name", keyPid: "pid", data: [{"id": "1", "name": "下拉1", "pid": "0"}, {"id": "2", "name": "下拉2", "pid": "0"},
                {"id": "11", "name": "下拉3", "pid": "1"}, {"id": "12", "name": "下拉4", "pid": "1"}]});
 */
Base.selectInit = function (params) {
    $("#" + params.id).addClass("position-relative");
    $("#" + params.id).data("data", params);
    var htmlStr = "<input class='form-control' readonly='readonly' style='background-color: white'/>";
    htmlStr += "<div class='select-div hidden'>";
    if (params.data.length < 1) {
        htmlStr += "暂无任何可选数据"
    } else {
        var keyId = params.keyId;
        var keyValue = params.keyValue;
        var keyPid = params.keyPid;
        var rootValue = params.rootValue;
        var data = params.data;
        var item;
        var icon;
        if (params.isOpen == false) {
            icon = "▼";
        } else {
            icon = "▲";
        }
        for (var index in data) {
            item = data[index];
            if (item[keyPid] == rootValue) {
                htmlStr += "<div class='select-option-div' keyId='" + item[keyId] + "' " +
                    "keyValue='" + item[keyValue] + "' keyPid='" + item[keyPid] + "' level='1'>";
                if (isParent(item[keyId], data, keyPid)) {
                    htmlStr += "<span isParent='true' keyId='" + item[keyId] + "'>" + icon + "</span>";
                } else {
                    htmlStr += "<span style='visibility:hidden;'>" + icon + "</span>";
                }
                htmlStr += item[keyValue] + "</div>";
                htmlStr += getSonHtmlStr(item, data, 1, keyId, keyValue, keyPid);
            }
        }
    }
    htmlStr += "</div>";
    $("#" + params.id).html(htmlStr);
    // 选择子项事件
    $("#" + params.id + " .select-option-div").click(function () {
        var inputNode = $("#" + params.id + " > input");
        inputNode.val($(this).attr("keyValue"));
        inputNode.data("nodeId", $(this).attr("keyId"));
        inputNode.data("nodeValue", $(this).attr("keyValue"));
        inputNode.data("nodePid", $(this).attr("keyPid"));
        var node = $("#" + params.id + " > .select-div");
        node.removeClass("show");
        node.addClass("hidden");
    });
    // input框获取焦点事件
    $("#" + params.id + " > input").focus(function () {
        var node = $("#" + params.id + " > .select-div");
        node.removeClass("hidden");
        node.addClass("show");
    });
    /*// input框失去焦点事件
    $("#" + params.id + " > input").blur(function () {
        var node = $("#" + params.id + " > .select-div");
        node.removeClass("show");
        node.addClass("hidden");
    });*/
    // 判断是否显示
    if (params.isOpen == false) {
        $("#" + params.id + " .select-option-div").each(function (i, n) {
            if ($(this).attr("level") > 1) {
                $(this).addClass("hidden");
            }
        });
    }
    // 子节点 显示/隐藏切换
    $("#" + params.id + " span[isParent='true']").click(function (e) {
        window.event ? window.event.cancelBubble = true : e.stopPropagation();
        if ($(this).text() == "▼") {
            $(this).text("▲");
        } else {
            $(this).text("▼");
        }
        var keyId = $(this).attr("keyId");
        $("#" + params.id + " .select-option-div[keyPid='" + keyId + "']").each(function (i, n) {
            if (n.className.indexOf("hidden") > -1) {
                $(n).addClass("show");
                $(n).removeClass("hidden");
            } else {
                $(n).addClass("hidden");
                $(n).removeClass("show");
            }
        });
    });

    /**
     * 迭代函数：获取节点及子节点的html字符
     * @param node 节点json对象
     * @param data 所有节点json数组
     * @param level 层级
     * @param keyId 存储节点ID的key值
     * @param keyValue 存储节点value的key值
     * @param keyPid 存储节点pid的key值
     */
    function getSonHtmlStr(node, data, level, keyId, keyValue, keyPid) {
        level++;
        var html = "";
        var id = node[keyId];
        var item;
        var paddingLeft = level * 10;
        for (var index in data) {
            item = data[index];
            if (item[keyPid] == id) {
                html += "<div class='select-option-div' style='padding-left: " + paddingLeft + "px;' keyId='" + item[keyId] + "' " +
                    "keyValue='" + item[keyValue] + "' keyPid='" + item[keyPid] + "' level='" + level + "'>";
                if (isParent(item[keyId], data, keyPid)) {
                    html += "<span isParent='true' keyId='" + item[keyId] + "'>" + icon + "</span>";
                } else {
                    html += "<span style='visibility:hidden;'>" + icon + "</span>";
                }
                html += item[keyValue] + "</div>";
                if (isParent(item["id"], data, keyPid)) {
                    html += getSonHtmlStr(item, data, ++level, keyId, keyValue, keyPid);
                }
            }
        }
        return html;
    }

    /**
     * 判断该节点是否是父节点
     * @param id 当前节点id
     * @param list 集合list
     * @param pid 存储节点pid的key值
     * @returns {boolean}
     */
    function isParent(id, list, pid) {
        var flag = false;
        $.each(list, function (i, n) {
            if (n[pid] == id) {
                flag = true;
                return false;
            }
        });
        return flag;
    }
}

Base.setSelectData = function (id, valueId) {
    var params = $("#" + id).data("data");
    var keyId = params.keyId;
    var keyValue = params.keyValue;
    var keyPid = params.keyPid;
    var data = params.data;
    $.each(data, function (i, n) {
        if (n[keyId] == valueId) {
            var inputNode = $("#" + id + " > input");
            inputNode.val(n[keyValue]);
            inputNode.data("nodeId", n[keyId]);
            inputNode.data("nodeValue", n[keyValue]);
            inputNode.data("nodePid", n[keyPid]);
            return false;
        }
    });
}

Base.getSelectData = function (id) {
    var inputNode = $("#" + id + " > input");
    return {
        nodeId: inputNode.data("nodeId"),
        nodeValue: inputNode.data("nodeValue"),
        nodePid: inputNode.data("nodePid")
    };
}

/**
 * 让某一个面板出现半透明蒙层，提示：读取中
 * @param id 面板的id，如果不传或null就是整个页面
 */
Base.showMask = function (id) {
    var node;
    if (id != undefined && id != null && id != "") {
        node = $("#" + id)[0];
    } else {
        node = window.document.body;
    }
    var loadingId = new Date().getMilliseconds();
    var loading = "<div class='show loading' id='" + loadingId + "'>\n" +
        "        <div style='position: relative; left: calc(50% - 30px); top: 50%;font-size: 18px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;'>\n" +
        "        请求中...\n" +
        "        </div>\n" +
        "        </div>";
    $(node).append(loading);
    return loadingId;
}

/**
 * 隐藏蒙层
 * @param loadingId 蒙层id
 */
Base.hideMask = function (loadingId) {
    var elem = $("#" + loadingId)[0];
    elem.parentNode.removeChild(elem);
    // $('#loading').modal('hide');
}

/**
 * 判断是否为空：为空返回true
 * @param obj
 */
Base.isNull = function (obj) {
    if (obj == undefined || obj == null || obj == "") {
        return true;
    }
    return false;
}

/**
 * 判断对象是否为空：不为空返回true
 * @param obj
 * @returns {boolean}
 */
Base.isNotNull = function (obj) {
    return !Base.isNull(obj);
}

/**
 * 提示框
 * @param type  alert, success, error, warning, info
 * @param title 标题，可以包括HTML内容（input元素除外）
 * @param description 描述，可以包括HTML内容（input元素除外）
 */
Base.alert = function (description, type, title) {
    var icon = 6;
    if (type == 'error') {
        icon = 5;
    } else if (type == 'success') {
        icon = 1;
    } else if (type == 'warning') {
        icon = 7;
    }
    var params = {
        id: "tortoise_window_msg",
        offset: "t",
        icon: icon,
        anim: 5,
        time: 1000
    };
    top.layer.msg(description, params, function () {
        //do something
    });
    /*window.top.GrowlNotification.notify({
        width: '250px',                // 消息通知框的宽度，例如100px, 50%...
        //zIndex: 1056,               // 消息通知框的 z-index
        margin: 20,
        type: type,            // alert, success, error, warning, info
        title: title,                  // 标题，可以包括HTML内容（input元素除外）
        description: description,            // 描述，可以包括HTML内容（input元素除外）
        image: {
            visible: false,         // 显示隐藏图片
            customImage: ''         // 自定义图片的路径
        },
        closeTimeout: 1000,            // 延迟关闭对话框的时间，单位毫秒。
        closeWith: ['click', 'button'],     // click, button
        animation: {
            open: 'slide-in',       // 如果是 string, 表示使用css类名. 如果是false|null|'none', 不会使用动画效果。 'slide-in', 'fade-in'
            close: 'slide-out'      // 如果string,表示使用css类名. 如果是 false|null|'none',不会使用动画效果。 'slide-out', 'fade-out'
        },
        animationDuration: .2,
        position: 'top-center',      // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
        showBorder: false,          // 显示或隐藏边框。
        showButtons: false,         // 显示或隐藏按钮。
        buttons: {
            action: {
                text: 'Ok',
                callback: function () {
                }
            },
            cancel: {
                text: 'Cancel',
                callback: function () {
                }
            }
        },
        showProgress: false         // 显示或隐藏进度条
    });*/
}

Base.initSelect = function (form, node, aaa100, aaa101) {
    // 获取 房间类型
    Base.submitGet("", "/dict/getDicts.do", {"aaa100": aaa100, "aaa101": aaa101}, null, function (data) {
        if (Base.isNotNull(data.data)) {
            var dicts = data.data;
            if (dicts.length > 0) {
                for (var i = 0, len = dicts.length; i < len; i++) {
                    var item = document.createElement("option");
                    item.value = dicts[i].aaa103;
                    item.innerHTML = dicts[i].aaa104;
                    node.append(item);
                }
            }
            form.render('select'); //刷新select选择框渲染
        }
    });
}

Base.toDateString = function (date, format) {
    var ret;
    var opt = {
        "y+": date.getFullYear().toString(),        // 年
        "M+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "m+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (var k in opt) {
        ret = new RegExp("(" + k + ")").exec(format);
        if (ret) {
            format = format.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
        ;
    }
    ;
    return format;
}