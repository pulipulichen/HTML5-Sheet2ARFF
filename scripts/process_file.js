var _process_file = function (_input, _callback) {
    _loading_enable();
    var _panel = $(".file-process-framework");
    //------------------
    
    let removeQuote = item => {
      if (item.startsWith('"') && item.endsWith('"')) {
        item = item.slice(0, -1)
      }
      return item
    }

    var _is_numeric = true;

    var _lines = _input.trim().split("\n");
    
    //console.log(_lines)
    
    var _class_field = $("#class_field").val().trim().split(",");
    _class_field.forEach(removeQuote)
    var _class_field_name = null; 
    var _string_fields = $("#string_fields").val().trim().split(",");
    _string_fields.forEach(removeQuote)
    var _date_fields = $("#date_fields").val().trim().split(",");
    _date_fields.forEach(removeQuote)
    var _timestamp_fields = $("#timestamp_fields").val().trim().split(",");
    _timestamp_fields.forEach(removeQuote)
    var _skiplist_fields = $("#skiplist_fields").val().trim().split(",");
    _skiplist_fields.forEach(removeQuote)
    var _is_timeseries_forecast_mode = false;
    //console.log(_input);

    var _attr_list = [];
    var _attr_type = {};
    var _norminal_list = {};
    var _class_index;
    var _class_list = [];
    var _train_data = [];
    var _test_data = [];
    var _date_attr_index = -1;
    var _timestamp_attr_index = -1;
    var _skiplist_attr_index = -1;
    var _month_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    var _timeseries_periodics_custom_fields = {};
    var _skiplist_date_content = [];
    
    var _unknown_count = 0;
    
    var _toker = $('[name="toker"]:checked').val();
    let isTimeSeriesMode = false
    for (var _l = 0; _l < _lines.length; _l++) {
      
      
        if (_l === 1 && _class_index === undefined) {
          if (isTimeSeriesMode === true) {
            // 嘗試把剩下的欄位作為target
            let fields = lineToValue(_lines[0])
            let dateAttrIndex = getIndexFromFields(fields, _date_fields)
            let timestampAttrIndex = getIndexFromFields(fields, _timestamp_fields)
            //console.log(fields, dateAttrIndex, timestampAttrIndex)
            if (_skiplist_attr_index > -1 
                    && (dateAttrIndex > -1 || timestampAttrIndex > -1)
                    && fields.length === 3) {
              let targetField = [0,1,2].filter(index => {
                return (index !== dateAttrIndex
                        && index !== timestampAttrIndex
                        && _skiplist_attr_index)
              })
              _class_index = targetField[0]
              
              _attr_type['target'] = _attr_type[_attr_list[_class_index]]
              _attr_list[_class_index] = 'target'
              _class_field_name = 'target'
            }
            else if ((dateAttrIndex > -1 || timestampAttrIndex > -1)
                    && fields.length === 2) {
              let targetField = [0,1].filter(index => {
                return (index !== dateAttrIndex
                        && index !== timestampAttrIndex)
              })
              _class_index = targetField[0]
              
              _attr_type['target'] = _attr_type[_attr_list[_class_index]]
              console.log(_class_index, _attr_list)
              _attr_list[_class_index] = 'target'
              console.log(_class_index, _attr_list)
              _class_field_name = 'target'
            }
          }
          
          if (_class_index === undefined) {
            alert('Class field "' + _class_field.join(", ") + '" not found.');
            _loading_disable();
            if (typeof (_callback) === "function") {
                _callback();
            }
            return;
          }
        } 
        
//        if (_l > 0) {
//          console.log(isTimeSeriesMode, _skiplist_attr_index)
//        }
        
        var _fields = _lines[_l].split(",");
        var _line_fields = [];
        
        for (var _f = 0; _f < _fields.length; _f++) {
            var _value = _fields[_f].trim();
            //if ((_value.substr(0, 1) === '"' || _value.substr(0, 1) === "'")
            //        && (_value.substr(_value.length - 1, 1) === '"' || _value.substr(_value.length - 1, 1) === "'")) {
                //_value = _value.substr(1, _value.length - 1);
            //}
            if (_value.startsWith('"') && _value.endsWith('"')) {
              _value = _value.slice(1, -1)
            }
            if (_value.startsWith("'") && _value.endsWith("'")) {
              _value = _value.slice(1, -1)
            }

            //console.log(_value);

            if (_l === 0) {
              
              if (_f === 0) {
                isTimeSeriesMode = checkIsTimeSeriesMode(_fields, _date_fields, _timestamp_fields)
              }
              
                // 第一行，是屬性
                _attr_list.push(_value);
                _attr_type[_value] = 'numeric';
                //if (_value === "class") {
                //if (_value === _class_field) {
                //console.log(_value);
                if ($.inArray(_value, _class_field) > -1 ) {
                    _class_index = _f;
                    _class_field_name = _value;
                    //console.log('有')
                }
                //console.log(_value);
            }
            else {
                //console.log([isNaN(_value), _value]);
                //console.log("第二行之後", _f, _attr_list, _value, _attr, _class_index, _value !== "?")
                if (_f !== _class_index 
                        && _value !== "?" ) {
                    
                    if (_value !== "?") {
                        _value = "'" + _value + "'";
                    }
                    
                    var _attr = _attr_list[_f];
                    //console.log("_attr", _attr);
                    if ($.inArray(_attr, _string_fields) > -1) {
                        _attr_type[_attr] = "string";
                    }
                    else if ($.inArray(_attr, _date_fields) > -1) {
                        _attr_type[_attr] = "date 'yyyy-MM-dd'";
                        _is_timeseries_forecast_mode = true;
                        
                        // 更換屬性名稱
                        _attr_list[_f] = 'date'
                        _attr_type['date'] = "date 'yyyy-MM-dd'";
                        //_attr_type[_attr]
                        
                        _date_attr_index = _f;
                    }
                    else if ($.inArray(_attr, _timestamp_fields) > -1) {
                        _attr_type[_attr] = "date 'yyyy-MM-dd HH:mm:ss'";
                        
                        // 更換屬性名稱
                        _attr_list[_f] = 'timestamp'
                        _attr_type['timestamp'] = _attr_type[_attr]
                        delete _attr_type[_attr]
                        
                        _is_timeseries_forecast_mode = true;
                        _timestamp_attr_index = _f;
                    }
                    else {
                        _attr_type[_attr] = "nominal";
                        if ( typeof(_norminal_list[_attr]) === "undefined") {
                            _norminal_list[_attr] = [];
                        }
                        if ($.inArray(_value, _norminal_list[_attr]) === -1) {
                          
                          _norminal_list[_attr].push(_value);
                        }
                        
                        //console.log("_attr", _attr)
                        if ($.inArray(_attr, _skiplist_fields) > -1) {
                            _skiplist_attr_index = _f;
                            //console.log(_f);
                        }
                    }
                    
                }
                _value = dataChineseToAD(_value)
                _line_fields.push(_value);
                if (_f === _class_index 
                        && _value !== "?" 
                        && $.inArray(_value, _class_list) === -1) {
                  
                    _class_list.push(_value);

                    //console.log([_value, isNaN(_value)]);
                    if (isNaN(_value)) {
                        _is_numeric = false;
                    }
                }
            }
        }   //  for (var _f = 0; _f < _fields.length; _f++) {

        
        if (_line_fields.length > 0) {
            //console.log(_fields[_class_index].trim());
            //console.log([_class_index], _fields);
            //if (_fields[_class_index].trim() !== "?"
            //        || _is_timeseries_forecast_mode === true) {
            
            if (_fields[_class_index].trim() !== "?") {
                _train_data.push(_line_fields);
                
                if (_is_timeseries_forecast_mode === true) {
                    _unknown_count = 0;
                }
            }
            else {
                _test_data.push(_line_fields);
                
                //console.log("skip?", _skiplist_attr_index, _line_fields);
                if (_is_timeseries_forecast_mode === true
                        && _skiplist_attr_index > -1
                        && ((_line_fields[_skiplist_attr_index].toLowerCase().indexOf('false') > -1) 
                        || (_line_fields[_skiplist_attr_index].toLowerCase().indexOf('0') > -1))) {
                    _unknown_count = _unknown_count + 1;
                }
                //console.log(_unknown_count);
            }
            
            if (_is_timeseries_forecast_mode === true) {
                var _ori_date;
                var _date;
                //var _next_date;
                
                //var _next_line_fields = [];
                //if (_l < _lines.length - 1) {
                //    _next_line_fields = _lines[(_l+1)].split(",");
                //}
                //else {
                //    _next_line_fields = _lines[(_l-1)].split(",");
                //}
                
                if (_date_attr_index > -1) {
                    _ori_date = _line_fields[_date_attr_index].trim();
                    
                    _ori_date = dataChineseToAD(_ori_date)
                    //console.log(_ori_date)
                    _date = new Date(_ori_date);
                    
                    //_next_date = _next_line_fields[_date_attr_index].trim();
                    //_next_date = new Date(_next_date);
                    //var _interval_time = Math.abs(_next_date.getTime() - _date.getTime());
                    //console.log([_next_date.getTime(), _date.getTime()]);
                    //_next_date = new Date((_date.getTime() + _interval_time));
                    
                    //_date = '=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':' + _date.getDate() + ':*:*:*:*:*:*:*/';
                    //_date = '>=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':' + _date.getDate() + ':*:*:*:*:*:*:*' 
                    //        + ' <' +  _date.getFullYear() + ':' + _month_names[((_date.getMonth()+1)%12)] + ':' + _date.getDate() + ':*:*:*:*:*:*:*' + '/';
                    //_date = '<=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':' + _date.getDate() + ':*:*:*:*:*:*:*/';
                    //_date = '=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':' + '*' + ':*:*:*:*:*:*:*/';
                    //_date = '>=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':' + _date.getDate() + ':*:*:*:*:*:*:*' 
                    //        + ' <' +  _next_date.getFullYear() + ':' + _month_names[_next_date.getMonth()] + ':' + _next_date.getDate() + ':*:*:*:*:*:*:*' + '/';
                    _date = '=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':*:*:*:' + _date.getDate() + ':*:*:*:*/';
                }
                else if (_timestamp_attr_index > -1) {
                    _ori_date = _line_fields[_timestamp_attr_index].trim();
                    _date = new Date(_ori_date);
                    _date = '>=' + _date.getFullYear() + ':' + _month_names[_date.getMonth()] + ':' + _date.getDate() 
                            + ':*:*:*:*:' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds() + '/';
                }
                
                for (var _t = 0; _t < _line_fields.length; _t++) {
                    if (_t === _timestamp_attr_index || _t === _date_attr_index || _t === _class_index) {
                        continue;
                    }
                    else if (_t === _skiplist_attr_index) {
                        var _label = _line_fields[_t];
                        _label = _label.toLowerCase();
                        //console.log("_label", _label)
                        if (_label === "'true'" || _label === "'1'") {
                            if (_ori_date.substr(0,1) === "'") {
                                _ori_date = _ori_date.substr(1, _ori_date.length-2);
                            }
                            if (_date_attr_index > -1) {
                                _skiplist_date_content.push(_ori_date + '@yyyy-MM-dd');
                            }
                            else {
                                _skiplist_date_content.push(_ori_date + '@yyyy-MM-dd HH:mm:ss');
                            }
                        }
                    }
                    else {
                        var _label = _line_fields[_t];
                        if (_label.substr(0,1) === "'") {
                            _label = _label.substr(1, _label.length-2);
                        }
                        var _attr_name = _attr_list[_t];
                        _date = _date + _label;
                        //console.log(_attr_name);
                        //console.log(_date);

                        if (typeof(_timeseries_periodics_custom_fields[_attr_name]) === 'undefined') {
                            _timeseries_periodics_custom_fields[_attr_name] = [];
                        }
                        _timeseries_periodics_custom_fields[_attr_name].push(_date);
                    }
                }
                
                $(".step_filename").val(_unknown_count);
            }
        }
    }
    
    var _title = "Weka Spreadsheet to ARFF (file process framework 20170401)";
    
    var _loop_wait = function (_data, _row_index, _col_index, _callback) {
        
        if (_row_index % 100 === 0) {
            try {
                //console.log([_row_index, _data.length, _col_index, _data[_row_index].length]);
                var _percent = Math.ceil(_row_index / _data.length * 100);
                var _percent_title = "(" + _percent + "%) " + _title;
                document.title = _percent_title;
            }
            catch (e) {}
            
            setTimeout(function () {    
                _loop(_data, _row_index, _col_index, _callback);
            }, 1);
        }
        else {
            _loop(_data, _row_index, _col_index, _callback);
        }
    };

    var _loop = function (_data, _row_index, _col_index, _callback) {
        if (_row_index < _data.length) {
            if (_col_index < _data[_row_index].length && _col_index !== _class_index) {
                var _text = _data[_row_index][_col_index];
                
                var _attr = _attr_list[_col_index];
                //console.log([_attr, _string_fields]);
                if ($.inArray(_attr, _string_fields) === -1) {
                    if (isNaN(_text) === true && _text !== '?') {
                        _text = _text.substring(1, _text.length - 1);
                        _text = "'" + _text + "'";
                    }
                    _data[_row_index][_col_index] = _text;

                    _col_index++;
                    _loop_wait(_data, _row_index, _col_index, _callback);
                    return;
                }
                else {
                    _text = _text.substring(1, _text.length - 1);
                    if (_toker === "radio_seg_auto") {
                      var _slice = _text.slice(0,20)
                      //console.log(_slice)
                      if (_slice.split(" ").length > 3) {
                        _toker = "radio_space"
                      }
                      else {
                        _toker = "radio_jieba"
                      }
                      //console.log(_toker)
                    }
                    
                    if (_toker === "radio_jieba") {
                        call_jieba_cut_join(_text, ' ', function (_result) {
                            _data[_row_index][_col_index] = "'" + _result + "'";

                            _col_index++;
                            _loop_wait(_data, _row_index, _col_index, _callback);
                        });
                    }
                    else if (_toker === "radio_space") {
                        _data[_row_index][_col_index] = "'" + _text + "'";

                        _col_index++;
                        _loop_wait(_data, _row_index, _col_index, _callback);
                    }
                    else {
                        var _result = _add_chinese_space(_text)
                        _data[_row_index][_col_index] = "'" + _result + "'";

                        _col_index++;
                        _loop_wait(_data, _row_index, _col_index, _callback);
                    }
                }
            }
            else {
                _col_index = 0;
                _row_index++;
                _loop_wait(_data, _row_index, _col_index, _callback);
            }
        }
        else {
            document.title = _title;
            _callback();
        }
    };



    var _build_result = function () {
        var _train_title = _panel.find(".filename").val();
        _train_title = _train_title.substr(0, _train_title.lastIndexOf("."));
        var _test_title = _panel.find(".test_filename").val();
        _test_title = _test_title.substr(0, _test_title.lastIndexOf("."));

        var _result = "@relation '" + _train_title + "'\n\n";
        var _test_result = "@relation '" + _test_title + "'\n\n";

        //console.log(_attr_list.length);
        for (var _a = 0; _a < _attr_list.length; _a++) {
            var _attr = _attr_list[_a];
            //if (_attr !== "class") {
            //console.log(_attr);
            //if (_attr !== _class_field) {
            if ($.inArray(_attr, _class_field) === -1) {
              
                var _attr_setting = "@attribute " + _attr + " ";
                if (_attr_type[_attr] === "nominal") {
                    // 排序一下
                    var _array = JSON.parse(JSON.stringify(_norminal_list[_attr]));
                    _array = _array.sort();
                    _attr_setting = _attr_setting + "{" + _array.join(", ") + "}";
                }
                else {
                    _attr_setting = _attr_setting + _attr_type[_attr];
                }
                _attr_setting = _attr_setting + "\n";
                _result = _result + _attr_setting;
                _test_result = _test_result + _attr_setting;
            }
            else {
                if (_is_numeric === false) {
                    var _array = _class_list;
                    _array = _array.sort();
                    _result = _result + "@attribute " + _class_field_name + " {" + _array.join(", ") + "}\n";
                    _test_result = _test_result + "@attribute " + _class_field_name + " {" + _array.join(", ") + "}\n";
                }
                else {
                    _result = _result + "@attribute " + _class_field_name + " numeric\n";
                    _test_result = _test_result + "@attribute " + _class_field_name + " numeric\n";
                }
            }
        }

        _result = _result + "\n@data\n";
        _test_result = _test_result + "\n@data\n";

        //console.log(_train_data);
        for (var _d = 0; _d < _train_data.length; _d++) {
            _result = _result + _train_data[_d].join(",") + "\n";
        }
        for (var _d = 0; _d < _test_data.length; _d++) {
            _test_result = _test_result + _test_data[_d].join(",") + "\n";
        }

        _result = _result.trim();
        _test_result = _test_result.trim();

        _panel.find(".test_preview").val(_test_result);
        
        // --------------------------
        
        if (_is_timeseries_forecast_mode === true) {
           var _periodics_date = "time-series-periodics\n*pre-defined*:AM\n*pre-defined*:DayOfWeek\n*pre-defined*:DayOfMonth\n*pre-defined*:NumDaysInMonth\n*pre-defined*:Weekend\n*pre-defined*:Month\n*pre-defined*:Quarter"; 
           for (var _attr_name in _timeseries_periodics_custom_fields) {
               _periodics_date = _periodics_date + "\n*custom*:" + _attr_name + "\n" + _timeseries_periodics_custom_fields[_attr_name].join("\n");
           }
           _panel.find("#periodics_preview").val(_periodics_date);
           
           _panel.find("#skiplist_preview").val(_skiplist_date_content.join(","));
        }
        
        if (_is_timeseries_forecast_mode === true) {
            $(".download-periodics-data-set").show();
            $(".periodics-filename-field").show();
            $(".periodics-content-field").show();
            
            $(".download-skiplist-data-set").show();
            $(".skiplist-filename-field").show();
            $(".skiplist-content-field").show();
            
            //console.log($(".step-filename-field").length);
            $(".step-filename-field").show();
            
            $(".download-test-data-set").hide();
            $(".test-filename-field").hide();
            $(".test-content-field").hide();
        }
        else {
            $(".download-periodics-data-set").hide();
            $(".periodics-filename-field").hide();
            $(".periodics-content-field").hide();
            
            $(".download-skiplist-data-set").hide();
            $(".skiplist-filename-field").hide();
            $(".skiplist-content-field").hide();
            
            $(".step-filename-field").hide();
            
            $(".download-test-data-set").show();
            $(".test-filename-field").show();
            $(".test-content-field").show();
        }
        
        // --------------------------

        _loading_disable();
        if (typeof (_callback) === "function") {
            _callback(_result);
        }

    };    //var _build_result = function () {

    // --------------------

    if ($("#enable_toker:checked").length === 1) {
        _loop(_train_data, 0, 0, function () {
            _loop(_test_data, 0, 0, function () {
                _build_result();
            });
        });
    }
    else {
        _build_result();
    }

    // --------------------
};