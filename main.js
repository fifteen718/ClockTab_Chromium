/*
*********************
* 获取时间 -- start *
*********************
*/ 

// function - 日期格式化
function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}

// function - 获取当月剩余天数
// function getMonthResidue(today) {
//     var now = today.getDate();
//     var year = today.getYear();
//     if (year < 2000) year += 1900;
//     var month = today.getMonth();
//     var monarr = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
//     if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) monarr[1] = "29";
//     return (monarr[month] - now)
// }

// function - 获取日期对象
function getDateObj(date) {
    var obj = {
        date: '',
        time: '',
        residue: ''
    }
    var week = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    obj.date = zeroPadding(date.getFullYear(), 4) + '-' + zeroPadding(date.getMonth() + 1, 2) + '-' + zeroPadding(date.getDate(), 2) + ' ' + week[date.getDay()];
    obj.time = zeroPadding(date.getHours(), 2) + ':' + zeroPadding(date.getMinutes(), 2) + ':' + zeroPadding(date.getSeconds(), 2);
    // obj.residue = getMonthResidue(date);
    return obj;
}

// function - DOM更新
var dateEl = document.getElementById("date")
var timeEl = document.getElementById("time")
function RenderHtml(obj) {
    dateEl.innerText = obj.date;
    timeEl.innerText = obj.time;
    // document.getElementById("residue").innerText = obj.residue;
}

// 发请求
var timestamp = Date.parse(new Date()); //时间戳 - 用于缓存当前时间

try {
    var xhr = new XMLHttpRequest();
    if (!xhr) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    var query = new Date().getTime(); // 清除缓存
    xhr.open("get", "https://cdn.jsdelivr.net/npm/vue@2.6.14?t=" + query, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var date = new Date(xhr.getResponseHeader("Date"));
            timestamp = Date.parse(date);
            var obj = getDateObj(date);
            RenderHtml(obj);
        }
    }
    xhr.send(null); // 发送请求
} catch (error) {
    console.error(error);
}

// 每秒更新显示时间 - 本地计算更新，避免频繁发送请求
function updateTime() {
    timestamp += 1000; // 1000毫秒
    var obj = getDateObj(new Date(timestamp));
    RenderHtml(obj);
}
setInterval(updateTime, 1000);
/*
*******************
* 获取时间 -- end *
*******************
*/ 



/*
*************************
* 获取缓存数据 -- start *
*************************
*/ 
var defaultData = [
    {
        "webUrl":"https://blog.csdn.net/fifteen718",
        "iconUrl":"https://g.csdnimg.cn/static/logo/favicon32.ico",
        "webName":"CSDN"
    },
    {
        "webUrl":"https://github.com/fifteen718",
        "iconUrl":"https://github.githubassets.com/favicons/favicon.png",
        "webName":"GitHub"
    },
    {
        "webUrl":"https://v3.cn.vuejs.org/",
        "iconUrl":"https://cn.vuejs.org/images/icons/favicon-32x32.png",
        "webName":"VueJS"
    },
    {
        "webUrl":"https://www.zhihu.com/",
        "iconUrl":"https://static.zhihu.com/heifetz/favicon.ico",
        "webName":"知乎"
    },
    {
        "webUrl":"https://tinypng.com/",
        "iconUrl":"https://tinypng.com/images/favicon.ico",
        "webName":"TinyPNG"
    }
]

var initData = copyData(defaultData)

var myKey = "myBookmarks";
var changeKey = "dataHasChanged"

var dataHasChanged = window.localStorage.getItem(changeKey);
var localValue = window.localStorage.getItem(myKey);

// 更新本地 localstorage
if (dataHasChanged && localValue) {
    // 数据已变更 且 有数据 >> 更新数据
    initData = JSON.parse(localValue);
    if (initData?.length == 0) {
        renderEmptyView()
    } 
    else if (initData?.length > 0) {
        reRender(initData)
    }
}

function reRender(data) {
    if(data?.length == 0) {
        renderEmptyView()
    }

    var newHtml = `
    <div class="addBtn baseBtn" id="addBtn" title="点击新增标签"> + </div>
    <div class="delBtn baseBtn bottomPosition" id="delBtn" title="点击删除标签"> - </div>`;

    data.forEach(item => {
        newHtml += `
        <a class="item" title="${item.webName}" target="_blank" href="${item.webUrl}">
        <div class="tile-icon">
            <img draggable="false" alt="" src="${item.iconUrl}">
        </div>
        <div class="tile-title"><span>${item.webName}</span></div>
        </a>`
    });
    var bookmarksView = document.getElementById('bookmarksView');
    bookmarksView.innerHTML = newHtml;
    bookmarksView.classList.remove("bgNone");

    // 重绑点击事件
    document.getElementById('addBtn').onclick = addHandler;
    document.getElementById('delBtn').onclick = delHandler;

}

/*
***********************
* 获取缓存数据 -- end *
***********************
*/ 


/*
*************************
* 按钮点击事件 -- start *
*************************
*/ 
var addBtn = document.getElementById('addBtn');
var delBtn = document.getElementById('delBtn');

var cancelBtn = document.getElementById('cancelBtn');
var commitBtn = document.getElementById('commitBtn');

var bookmarksView = document.getElementById('bookmarksView');
var addView = document.getElementById('addView');

var webUrlInput = document.getElementById("webUrl")
var iconUrlInput = document.getElementById("iconUrl")
var webNameInput = document.getElementById("webName")

addBtn && (addBtn.onclick = addHandler);
delBtn && (delBtn.onclick = delHandler);
commitBtn && (commitBtn.onclick = commitHandler);
cancelBtn && (cancelBtn.onclick = cancelHandler);

webUrlInput && (webUrlInput.oninput = judgeInputVal)
iconUrlInput && (iconUrlInput.oninput = judgeInputVal)
webNameInput && (webNameInput.oninput = judgeInputVal)

// 删除标签
function resetBtnOnclick() {
    var resetConfirm = confirm("一键重置将清空本地缓存书签，是否继续操作？")
    if (resetConfirm) {
        initData = copyData(defaultData)
        reRender(initData)
        resetLocalStorage()
    }
}

function delOverBtnOnclick() {
    reRender(initData)
}

function delItemBtnClick() {
   
    var thisWebUrl = this.dataset.weburl
    var newData = initData.filter(item => {
        return item.webUrl != thisWebUrl
    })
    initData = copyData(newData)

    if (initData.length > 0) {
        this.parentElement.remove()
    } else {
        renderEmptyView()
    }
   
    setLocalStorage(myKey, newData)
}

function delHandler() {
    var dataHasChanged = window.localStorage.getItem(changeKey);
    var localValue = window.localStorage.getItem(myKey);

    if (dataHasChanged && localValue) {
        // 数据已变更 且 有数据 >> 更新数据
        initData = JSON.parse(localValue);
    } else {
        initData = copyData(defaultData)
    }

    var delHtml = `
    <div class="delOverBtn baseBtn" id="delOverBtn" title="点击完成操作"> ✔ </div>
    <div class="resetBtn baseBtn bottomPosition" id="resetBtn" title="一键重置"> ↺ </div>`;

    initData.forEach(item => {
        delHtml += `
        <a class="item delItem" title="${item.webName}">
        <div class="delItemBtn" data-weburl="${item.webUrl}">
            ✖
        </div>
        <div class="tile-icon">
            <img draggable="false" alt="" src="${item.iconUrl}">
        </div>
        <div class="tile-title"><span>${item.webName}</span></div>
        </a>`
    });
    document.getElementById('bookmarksView').innerHTML = delHtml;
    var delItemBtnEls = document.getElementsByClassName("delItemBtn")
    for(let i = 0; i < delItemBtnEls.length; i++) {
        delItemBtnEls[i].onclick = delItemBtnClick
    }

    // 绑定点击事件
    document.getElementById('delOverBtn').onclick = delOverBtnOnclick;
    document.getElementById('resetBtn').onclick = resetBtnOnclick;

}

// 旋转至添加页面
function transToAddView () {
    bookmarksView.classList.remove("showClass")
    bookmarksView.classList.add("hideClass")
    addView.classList.remove("hideClass")
    addView.classList.add("showClass")
}

// 旋转至书签页面
function transToBookmarksView () {
    addView.classList.remove("showClass")
    addView.classList.add("hideClass")
    bookmarksView.classList.remove("hideClass")
    bookmarksView.classList.add("showClass")
}

function addHandler () {
    transToAddView()
}

function cancelHandler() {
    // 清空输入框
    webUrlInput.value = ""
    iconUrlInput.value = ""
    webNameInput.value = ""

    // 重置右上角图标
    commitBtn.style.display = "none"
    cancelBtn.style.display = "block"

    // 返回书签页面
    transToBookmarksView()
}

function commitHandler () {
    var webUrl = webUrlInput.value.trim()
    var webName = webNameInput.value.trim()
    var iconUrl = iconUrlInput.value.trim()
    
    if (!webUrl){
        alert("[站点链接] 不能为空！");
        return false;
    }

    if (!webName){
        alert("[站点名称] 不能为空！");
        return false;
    }

    if (!iconUrl) {
        iconUrl = './img/default-icon.png'
    }

    initData.push({
        webUrl,
        iconUrl,
        webName
    });
    reRender(initData);

    // 本地存储变更数据
    setLocalStorage(myKey, initData)

    // 清空并返回书签页面
    cancelHandler()
}

/*
***********************
* 按钮点击事件 -- end *
***********************
*/ 


/*
***********************
* 监听输入框 -- start *
***********************
*/ 

var allIsInput = false;
var commitBtn = document.getElementById("commitBtn");
var cancelBtn = document.getElementById("cancelBtn");
function judgeInputVal() {
    if (webUrlInput.value.trim() && webNameInput.value.trim() && !allIsInput) {
        allIsInput = true;
        if (commitBtn.style.display == "none") {
            cancelBtn.style.display = "none"
            commitBtn.style.display = "block"
        }
    } else if (allIsInput && (!webUrlInput.value.trim() || !webNameInput.value.trim())) {
        allIsInput = false;
        if (cancelBtn.style.display == "none") {
            commitBtn.style.display = "none"
            cancelBtn.style.display = "block"
        }
    }
}

/*
*********************
* 监听输入框 -- end *
*********************
*/ 


/*
*********************
* 封装方法 -- start *
*********************
*/ 
// 变更缓存数据
function setLocalStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.localStorage.setItem(changeKey, "true")
}

// 清楚缓存
function resetLocalStorage() {
    window.localStorage.removeItem(myKey)
    window.localStorage.removeItem(changeKey)
}

// 对象深拷贝
function copyData(obj) {
    return JSON.parse(JSON.stringify(obj))
}
/*
*******************
* 封装方法 -- end *
*******************
*/ 

/*
**************************
* 无标签页面显示 -- start *
**************************
*/ 

function renderEmptyView() {
    var bookmarksView =  document.getElementById('bookmarksView')
    bookmarksView.classList.add("bgNone")
    var emptyHtml = `
    <div class="emptyAddBtn" id="emptyAddBtn" title="点击新增标签"> + </div>`;
   
    document.getElementById('bookmarksView').innerHTML = emptyHtml;

    // 绑定点击事件
    document.getElementById('emptyAddBtn').onclick = addHandler;
}

/*
*************************
* 无标签页面显示 -- end *
*************************
*/ 

/*
*************************
* 时间面板显示 -- start *
*************************
*/ 

var hideClockBtn = document.getElementById("hideClockBtn")
var showClockBtn = document.getElementById("showClockBtn")

hideClockBtn && (hideClockBtn.onclick = hideClockHandler);
showClockBtn && (showClockBtn.onclick = showClockHandler);

var showClockKey = "showClock"

function hideClockHandler () {
    document.getElementById("clockWrap").style.display = "none"
    showClockBtn.style.display = "block"
    window.localStorage.setItem(showClockKey, "false")
}

function showClockHandler () {
    showClockBtn.style.display = "none"
    document.getElementById("clockWrap").style.display = "block"
    window.localStorage.setItem(showClockKey, "true")
}

// 初始化时间面板显示
if (window.localStorage.getItem(showClockKey) == "false") {
    hideClockHandler()
}

/*
***********************
* 时间面板显示 -- end *
***********************
*/ 