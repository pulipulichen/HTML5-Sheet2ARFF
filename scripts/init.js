
/* global _load_textarea, _load_file, _download_file_button, _download_test_file_button, _download_skiplist_file_button, _download_periodics_file_button, _copy_table, _copy_csv_table, _change_to_fixed, _change_show_fulldata, _change_show_std, _copy_skip_list_textarea */

$(function () {
    var _panel = $(".file-process-framework");
    _panel.find(".input-mode.textarea").change(_load_textarea);
    _panel.find(".myfile").change(_load_file);
    _panel.find(".download-file").click(_download_file_button);
    _panel.find(".download-test-file").click(_download_test_file_button);
    _panel.find(".download-periodics-file").click(_download_periodics_file_button);
    _panel.find(".download-skiplist-file").click(_download_skiplist_file_button);

    $('.menu .item').tab();
    $("button.copy-table").click(_copy_table);
    $("button.copy-csv").click(_copy_csv_table);
    $("button.copy-skip-list").click(_copy_skip_list_textarea);
    $("#decimal_places").change(_change_to_fixed);

    $("#show_fulldata").change(_change_show_fulldata);
    $("#show_std").change(_change_show_std);

    // 20170108 測試用
    //_load_textarea();
});