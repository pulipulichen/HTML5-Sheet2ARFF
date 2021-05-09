// -------------------

var _add_chinese_space = function(_content) {
    if( Object.prototype.toString.call( _content ) === '[object Array]' ) {
        var _new_content = [];
        for (var _i = 0; _i < _content.length; _i++) {
            _new_content.push(_add_chinese_space(_content[_i]));
        }
        return _new_content;
    }
    
    var _result = _content;
    
    _result = _result.replace(/([_]|[\W])/g,function (_matches, _contents, _offset, _s) {
        if (_matches[0].match(/[0-9\s]/)) {
            return _matches[0];
        }
        else {
            return " " + _matches[0] + " ";
        }
    });
    _result = _result.replace(/@[\x00-\x08\x0B\x0C\x0E-\x1F]@/g, ' '); // 避免Solr illegal characters
    _result = _result.replace(/\s+/g, ' ');
    _result = _result.trim();
    return _result;
};

//console.log(_add_chinese_space("您可以探家自 Google 地球和支援合作夥伴建立的套件合大量111景點視訊和影像的資111aaa源函數庫"));
//console.log(_add_chinese_space("這份編號是tc_130的心靈錯位器真是太cool了"));
//console.log(_add_chinese_space("這個布丁是在無聊的世界中找尋樂趣的一種不能吃的食物，喜愛動漫畫、遊戲、程式，以及跟世間脫節的生活步調。"));
//console.log(_add_chinese_space("  測   試    看   看   "));
//console.log(_add_chinese_space("2013-03-24_23230021"));

// ---------------------

var _loading_enable = function () {
    $("#preloader").show().fadeIn();
};

var _loading_disable = function () {
    $("#preloader").fadeOut().hide();
};

// ---------------------

var arrayMin = function (arr) {
    return arr.reduce(function (p, v) {
        return (p < v ? p : v);
    });
};

var arrayMax = function (arr) {
    return arr.reduce(function (p, v) {
        return (p > v ? p : v);
    });
};

var _float_to_fixed = function (_float, _fixed) {
    var _place = 1;
    for (var _i = 0; _i < _fixed; _i++) {
        _place = _place * 10;
    }
    return Math.round(_float * _place) / _place;
};

var _stat_avg = function (_ary) {
    var sum = _ary.reduce(function (a, b) {
        return a + b;
    });
    var avg = sum / _ary.length;
    return avg;
};

var _stat_stddev = function (_ary) {
    var i, j, total = 0, mean = 0, diffSqredArr = [];
    for (i = 0; i < _ary.length; i += 1) {
        total += _ary[i];
    }
    mean = total / _ary.length;
    for (j = 0; j < _ary.length; j += 1) {
        diffSqredArr.push(Math.pow((_ary[j] - mean), 2));
    }
    return (Math.sqrt(diffSqredArr.reduce(function (firstEl, nextEl) {
        return firstEl + nextEl;
    }) / _ary.length));
};

// -------------------------------------

var _change_to_fixed = function () {
    var _to_fixed = $("#decimal_places").val();
    _to_fixed = parseInt(_to_fixed, 10);

    var _tds = $(".stat-result td[data-ori-value]");
    for (var _i = 0; _i < _tds.length; _i++) {
        var _td = _tds.eq(_i);
        var _value = _td.data("ori-value");
        _value = parseFloat(_value, 10);
        _value = _float_to_fixed(_value, _to_fixed);
        _td.text(_value);
    }
};

// -------------------------------------

var _output_filename_surffix = "_train_set";
var _output_filename_test_surffix = "_test_set";
var _output_filename_periodics_surffix = "_periodics_set";
var _output_filename_ext = ".arff";
var _output_filename_periodics_ext = ".periodics";
var _output_filename_skiplist_ext = ".txt";


// -------------------------------------

var _load_file = function (evt) {
    //console.log(1);
    if (!window.FileReader)
        return; // Browser is not compatible

    var _panel = $(".file-process-framework");

    _panel.find(".loading").removeClass("hide");

    var reader = new FileReader();
    var _result;

    var _original_file_name = evt.target.files[0].name;
    var _pos = _original_file_name.lastIndexOf(".");
    var _file_name = "train_set-" + _original_file_name.substr(0, _pos)
            //+ _output_filename_surffix
            //+ _original_file_name.substring(_pos, _original_file_name.length);
    _file_name = _file_name + _output_filename_ext;
    var _test_file_name = "test_set-" + _original_file_name.substr(0, _pos)
            //+ _output_filename_test_surffix
            //+ _original_file_name.substring(_pos, _original_file_name.length);
    _test_file_name = _test_file_name + _output_filename_ext;
    var _periodics_file_name = "periodics_set-" + _original_file_name.substr(0, _pos)
            //+ _output_filename_test_surffix
            //+ _original_file_name.substring(_pos, _original_file_name.length);
    _periodics_file_name = _periodics_file_name + _output_filename_periodics_ext;
    var _skiplist_file_name = "skip_list-" + _original_file_name.substr(0, _pos) + ".txt";
    
    var _file_type = _original_file_name.substring(_original_file_name.lastIndexOf(".")+1, _original_file_name.length).toLowerCase();
    //console.log(_file_type);

    _panel.find(".filename").val(_file_name);
    _panel.find(".test_filename").val(_test_file_name);
    _panel.find(".periodics_filename").val(_periodics_file_name);
    _panel.find(".skiplist_filename").val(_skiplist_file_name);
    
    reader.onload = function (evt) {
        if (evt.target.readyState !== 2)
            return;
        if (evt.target.error) {
            alert('Error while reading file');
            return;
        }

        //filecontent = evt.target.result;

        //document.forms['myform'].elements['text'].value = evt.target.result;
        _result = evt.target.result;
        
        if (_file_type !== "csv") {
            var workbook = XLSX.read(_result, {type: 'binary'});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            var _worksheet_json = XLSX.utils.sheet_to_json(worksheet);
            //console.log(_worksheet_json);
            
            var _csv = [];
            
            var _attr_list = [];
            for (var _col in _worksheet_json) {
                for (var _row in _worksheet_json[_col]) {
                    _attr_list.push(_row);
                }
                break;
            }
            _csv.push(_attr_list.join(","));
            
            for (var _col in _worksheet_json) {
                var _line = [];
                for (var _row in _worksheet_json[_col]) {
                    var _cell = _worksheet_json[_col][_row];
                    _cell = _cell.replace(",", " ");
                    if (_cell.indexOf(",") > -1) {
                        console.log(_cell);
                    }
                    _cell = _cell.replace("\n", " ");
                    _line.push(_cell);
                }
                _csv.push(_line.join(","));
            }
            
            
            _csv = _csv.join("\n");
            //var _csv = XLSX.utils.sheet_to_csv(worksheet);
            //console.log(_csv);
            _result = _csv;
        }
        
        _process_file(_result, function (_result) {
            _panel.find(".preview").val(_result);

            $(".file-process-framework .myfile").val("");
            $(".file-process-framework .loading").addClass("hide");
            _panel.find(".display-result").show();
            _panel.find(".display-result .encoding").show();

            var _auto_download = (_panel.find('[name="autodownload"]:checked').length === 1);
            if (_auto_download === true) {
                _panel.find(".download-file").click();
            }

            //_download_file(_result, _file_name, "txt");
        });
    };


    //console.log(_file_name);

    if (_file_type !== "csv") {
        reader.readAsBinaryString(evt.target.files[0]);
    }
    else {
        reader.readAsText(evt.target.files[0]);
    }
};

var _load_textarea = function (evt) {
    var _panel = $(".file-process-framework");

    // --------------------------

    var _result = _panel.find(".input-mode.textarea").val();
    if (_result.trim() === "") {
        return;
    }

    // ---------------------------

    _panel.find(".loading").removeClass("hide");

    // ---------------------------
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);

    var local = new Date(utc);
    //var _file_date = local.toJSON().slice(0, 19).replace(/:/g, "-");
    var time = new Date();
    var _file_date = ("0" + time.getHours()).slice(-2)
            + ("0" + time.getMinutes()).slice(-2);
    var _file_name = "train_set-" + _file_date + _output_filename_ext;
    var _test_file_name = "test_set-" + _file_date + _output_filename_ext;

    _panel.find(".filename").val(_file_name);
    _panel.find(".test_filename").val(_test_file_name);

    // ---------------------------

    _process_file(_result, function (_result) {
        _panel.find(".preview").val(_result);

        _panel.find(".loading").addClass("hide");
        _panel.find(".display-result").show();
        _panel.find(".display-result .encoding").hide();

        var _auto_download = (_panel.find('[name="autodownload"]:checked').length === 1);
        if (_auto_download === true) {
            _panel.find(".download-file").click();
        }
    });
};

var _download_file_button = function () {
    var _panel = $(".file-process-framework");

    var _file_name = _panel.find(".filename").val();
    var _data = _panel.find(".preview").val();

    _download_file(_data, _file_name, "arff");
};

var _download_test_file_button = function () {
    var _panel = $(".file-process-framework");

    var _file_name = _panel.find(".test_filename").val();
    var _data = _panel.find(".test_preview").val();

    _download_file(_data, _file_name, "arff");
};

var _download_periodics_file_button = function () {
    var _panel = $(".file-process-framework");

    var _file_name = _panel.find(".periodics_filename").val();
    var _data = _panel.find(".periodics_preview").val();

    _download_file(_data, _file_name, "periodics");
};

var _download_skiplist_file_button = function () {
    var _panel = $(".file-process-framework");

    var _file_name = _panel.find(".skiplist_filename").val();
    var _data = _panel.find(".skiplist_preview").val();

    _download_file(_data, _file_name, "text");
};

var _download_file = function (data, filename, type) {
    var a = document.createElement("a"),
            file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

}

// ------------------------
// ----------------------------

var _copy_table = function () {
    var _button = $(this);

    var _table = $($(this).data("copy-table"));
    var _tr_coll = _table.find("tr");

    var _text = "";
    for (var _r = 0; _r < _tr_coll.length; _r++) {
        if (_r > 0) {
            _text = _text + "\n";
        }

        var _tr = _tr_coll.eq(_r);
        var _td_coll = _tr.find("td");
        if (_td_coll.length === 0) {
            _td_coll = _tr.find("th");
        }
        for (var _c = 0; _c < _td_coll.length; _c++) {
            var _td = _td_coll.eq(_c);
            var _value = _td.text();

            if (_c > 0) {
                _text = _text + "\t";
            }
            _text = _text + _value.trim();
        }
    }

    _copy_to_clipboard(_text);
};

var _copy_csv_table = function () {
    var _button = $(this);

    var _text = $("#preview").val().replace(/,/g, "\t");

    _copy_to_clipboard(_text);
};

var _copy_to_clipboard = function (_content) {
    //console.log(_content);
    var _button = $('<button type="button" id="clipboard_button"></button>')
            .attr("data-clipboard-text", _content)
            .hide()
            .appendTo("body");

    var clipboard = new Clipboard('#clipboard_button');

    _button.click();
    _button.remove();
};

// -----------------------

var _change_show_fulldata = function () {

    var _show = ($("#show_fulldata:checked").length === 1);
    //console.log([$("#show_fulldata").attr("checked"), _show]);

    var _cells = $(".stat-result .fulldata");
    if (_show) {
        _cells.show();
    }
    else {
        _cells.hide();
    }
};

var _change_show_std = function () {
    var _show = ($("#show_std:checked").length === 1);

    var _cells = $(".stat-result tr.std-tr");
    if (_show) {
        _cells.show();
    }
    else {
        _cells.hide();
    }
};

// -----------------------
