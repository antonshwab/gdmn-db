"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XpbBuilderParams;
(function (XpbBuilderParams) {
    XpbBuilderParams[XpbBuilderParams["VERSION"] = 3] = "VERSION";
    XpbBuilderParams[XpbBuilderParams["DPB"] = 1] = "DPB";
    XpbBuilderParams[XpbBuilderParams["SPB_ATTACH"] = 2] = "SPB_ATTACH";
    XpbBuilderParams[XpbBuilderParams["SPB_START"] = 3] = "SPB_START";
    XpbBuilderParams[XpbBuilderParams["TPB"] = 4] = "TPB";
    XpbBuilderParams[XpbBuilderParams["BATCH"] = 5] = "BATCH";
    XpbBuilderParams[XpbBuilderParams["BPB"] = 6] = "BPB";
})(XpbBuilderParams = exports.XpbBuilderParams || (exports.XpbBuilderParams = {}));
/* Common, structural codes */
/****************************/
var isc_info;
(function (isc_info) {
    isc_info[isc_info["end"] = 1] = "end";
    isc_info[isc_info["truncated"] = 2] = "truncated";
    isc_info[isc_info["error"] = 3] = "error";
    isc_info[isc_info["data_not_ready"] = 4] = "data_not_ready";
    isc_info[isc_info["length"] = 126] = "length";
    isc_info[isc_info["flag_end"] = 127] = "flag_end";
})(isc_info = exports.isc_info || (exports.isc_info = {}));
/**********************************/
/* Database parameter block stuff */
/**********************************/
var isc_dpb;
(function (isc_dpb) {
    isc_dpb[isc_dpb["version1"] = 1] = "version1";
    isc_dpb[isc_dpb["version2"] = 2] = "version2";
    isc_dpb[isc_dpb["cdd_pathname"] = 1] = "cdd_pathname";
    isc_dpb[isc_dpb["allocation"] = 2] = "allocation";
    isc_dpb[isc_dpb["journal"] = 3] = "journal";
    isc_dpb[isc_dpb["page_size"] = 4] = "page_size";
    isc_dpb[isc_dpb["num_buffers"] = 5] = "num_buffers";
    isc_dpb[isc_dpb["buffer_length"] = 6] = "buffer_length";
    isc_dpb[isc_dpb["debug"] = 7] = "debug";
    isc_dpb[isc_dpb["garbage_collect"] = 8] = "garbage_collect";
    isc_dpb[isc_dpb["verify"] = 9] = "verify";
    isc_dpb[isc_dpb["sweep"] = 10] = "sweep";
    isc_dpb[isc_dpb["enable_journal"] = 11] = "enable_journal";
    isc_dpb[isc_dpb["disable_journal"] = 12] = "disable_journal";
    isc_dpb[isc_dpb["dbkey_scope"] = 13] = "dbkey_scope";
    isc_dpb[isc_dpb["number_of_users"] = 14] = "number_of_users";
    isc_dpb[isc_dpb["trace"] = 15] = "trace";
    isc_dpb[isc_dpb["no_garbage_collect"] = 16] = "no_garbage_collect";
    isc_dpb[isc_dpb["damaged"] = 17] = "damaged";
    isc_dpb[isc_dpb["license"] = 18] = "license";
    isc_dpb[isc_dpb["sys_user_name"] = 19] = "sys_user_name";
    isc_dpb[isc_dpb["encrypt_key"] = 20] = "encrypt_key";
    isc_dpb[isc_dpb["activate_shadow"] = 21] = "activate_shadow";
    isc_dpb[isc_dpb["sweep_interval"] = 22] = "sweep_interval";
    isc_dpb[isc_dpb["delete_shadow"] = 23] = "delete_shadow";
    isc_dpb[isc_dpb["force_write"] = 24] = "force_write";
    isc_dpb[isc_dpb["begin_log"] = 25] = "begin_log";
    isc_dpb[isc_dpb["quit_log"] = 26] = "quit_log";
    isc_dpb[isc_dpb["no_reserve"] = 27] = "no_reserve";
    isc_dpb[isc_dpb["user_name"] = 28] = "user_name";
    isc_dpb[isc_dpb["password"] = 29] = "password";
    isc_dpb[isc_dpb["password_enc"] = 30] = "password_enc";
    isc_dpb[isc_dpb["sys_user_name_enc"] = 31] = "sys_user_name_enc";
    isc_dpb[isc_dpb["interp"] = 32] = "interp";
    isc_dpb[isc_dpb["online_dump"] = 33] = "online_dump";
    isc_dpb[isc_dpb["old_file_size"] = 34] = "old_file_size";
    isc_dpb[isc_dpb["old_num_files"] = 35] = "old_num_files";
    isc_dpb[isc_dpb["old_file"] = 36] = "old_file";
    isc_dpb[isc_dpb["old_start_page"] = 37] = "old_start_page";
    isc_dpb[isc_dpb["old_start_seqno"] = 38] = "old_start_seqno";
    isc_dpb[isc_dpb["old_start_file"] = 39] = "old_start_file";
    isc_dpb[isc_dpb["drop_walfile"] = 40] = "drop_walfile";
    isc_dpb[isc_dpb["old_dump_id"] = 41] = "old_dump_id";
    isc_dpb[isc_dpb["wal_backup_dir"] = 42] = "wal_backup_dir";
    isc_dpb[isc_dpb["wal_chkptlen"] = 43] = "wal_chkptlen";
    isc_dpb[isc_dpb["wal_numbufs"] = 44] = "wal_numbufs";
    isc_dpb[isc_dpb["wal_bufsize"] = 45] = "wal_bufsize";
    isc_dpb[isc_dpb["wal_grp_cmt_wait"] = 46] = "wal_grp_cmt_wait";
    isc_dpb[isc_dpb["lc_messages"] = 47] = "lc_messages";
    isc_dpb[isc_dpb["lc_ctype"] = 48] = "lc_ctype";
    isc_dpb[isc_dpb["cache_manager"] = 49] = "cache_manager";
    isc_dpb[isc_dpb["shutdown"] = 50] = "shutdown";
    isc_dpb[isc_dpb["online"] = 51] = "online";
    isc_dpb[isc_dpb["shutdown_delay"] = 52] = "shutdown_delay";
    isc_dpb[isc_dpb["reserved"] = 53] = "reserved";
    isc_dpb[isc_dpb["overwrite"] = 54] = "overwrite";
    isc_dpb[isc_dpb["sec_attach"] = 55] = "sec_attach";
    isc_dpb[isc_dpb["disable_wal"] = 56] = "disable_wal";
    isc_dpb[isc_dpb["connect_timeout"] = 57] = "connect_timeout";
    isc_dpb[isc_dpb["dummy_packet_interval"] = 58] = "dummy_packet_interval";
    isc_dpb[isc_dpb["gbak_attach"] = 59] = "gbak_attach";
    isc_dpb[isc_dpb["sql_role_name"] = 60] = "sql_role_name";
    isc_dpb[isc_dpb["set_page_buffers"] = 61] = "set_page_buffers";
    isc_dpb[isc_dpb["working_directory"] = 62] = "working_directory";
    isc_dpb[isc_dpb["sql_dialect"] = 63] = "sql_dialect";
    isc_dpb[isc_dpb["set_db_readonly"] = 64] = "set_db_readonly";
    isc_dpb[isc_dpb["set_db_sql_dialect"] = 65] = "set_db_sql_dialect";
    isc_dpb[isc_dpb["gfix_attach"] = 66] = "gfix_attach";
    isc_dpb[isc_dpb["gstat_attach"] = 67] = "gstat_attach";
    isc_dpb[isc_dpb["set_db_charset"] = 68] = "set_db_charset";
    isc_dpb[isc_dpb["gsec_attach"] = 69] = "gsec_attach";
    isc_dpb[isc_dpb["address_path"] = 70] = "address_path";
    isc_dpb[isc_dpb["process_id"] = 71] = "process_id";
    isc_dpb[isc_dpb["no_db_triggers"] = 72] = "no_db_triggers";
    isc_dpb[isc_dpb["trusted_auth"] = 73] = "trusted_auth";
    isc_dpb[isc_dpb["process_name"] = 74] = "process_name";
    isc_dpb[isc_dpb["trusted_role"] = 75] = "trusted_role";
    isc_dpb[isc_dpb["org_filename"] = 76] = "org_filename";
    isc_dpb[isc_dpb["utf8_filename"] = 77] = "utf8_filename";
    isc_dpb[isc_dpb["ext_call_depth"] = 78] = "ext_call_depth";
    isc_dpb[isc_dpb["auth_block"] = 79] = "auth_block";
    isc_dpb[isc_dpb["client_version"] = 80] = "client_version";
    isc_dpb[isc_dpb["remote_protocol"] = 81] = "remote_protocol";
    isc_dpb[isc_dpb["host_name"] = 82] = "host_name";
    isc_dpb[isc_dpb["os_user"] = 83] = "os_user";
    isc_dpb[isc_dpb["specific_auth_data"] = 84] = "specific_auth_data";
    isc_dpb[isc_dpb["auth_plugin_list"] = 85] = "auth_plugin_list";
    isc_dpb[isc_dpb["auth_plugin_name"] = 86] = "auth_plugin_name";
    isc_dpb[isc_dpb["config"] = 87] = "config";
    isc_dpb[isc_dpb["nolinger"] = 88] = "nolinger";
    isc_dpb[isc_dpb["reset_icu"] = 89] = "reset_icu";
    isc_dpb[isc_dpb["map_attach"] = 90] = "map_attach";
})(isc_dpb = exports.isc_dpb || (exports.isc_dpb = {}));
var tpb;
(function (tpb) {
    tpb[tpb["isc_tpb_version1"] = 1] = "isc_tpb_version1";
    tpb[tpb["isc_tpb_consistency"] = 1] = "isc_tpb_consistency";
    tpb[tpb["isc_tpb_concurrency"] = 2] = "isc_tpb_concurrency";
    tpb[tpb["isc_tpb_wait"] = 6] = "isc_tpb_wait";
    tpb[tpb["isc_tpb_nowait"] = 7] = "isc_tpb_nowait";
    tpb[tpb["isc_tpb_read"] = 8] = "isc_tpb_read";
    tpb[tpb["isc_tpb_write"] = 9] = "isc_tpb_write";
    tpb[tpb["isc_tpb_ignore_limbo"] = 14] = "isc_tpb_ignore_limbo";
    tpb[tpb["isc_tpb_read_committed"] = 15] = "isc_tpb_read_committed";
    tpb[tpb["isc_tpb_autocommit"] = 16] = "isc_tpb_autocommit";
    tpb[tpb["isc_tpb_rec_version"] = 17] = "isc_tpb_rec_version";
    tpb[tpb["isc_tpb_no_rec_version"] = 18] = "isc_tpb_no_rec_version";
    tpb[tpb["isc_tpb_restart_requests"] = 19] = "isc_tpb_restart_requests";
    tpb[tpb["isc_tpb_no_auto_undo"] = 20] = "isc_tpb_no_auto_undo";
})(tpb = exports.tpb || (exports.tpb = {}));
/*********************************/
/* Service parameter block stuff */
/*********************************/
var isc_spb;
(function (isc_spb) {
    isc_spb[isc_spb["version1"] = 1] = "version1";
    isc_spb[isc_spb["current_version"] = 2] = "current_version";
    isc_spb[isc_spb["version"] = 2] = "version";
    isc_spb[isc_spb["version3"] = 3] = "version3";
    isc_spb[isc_spb["user_name"] = 28] = "user_name";
    isc_spb[isc_spb["sys_user_name"] = 19] = "sys_user_name";
    isc_spb[isc_spb["sys_user_name_enc"] = 31] = "sys_user_name_enc";
    isc_spb[isc_spb["password"] = 29] = "password";
    isc_spb[isc_spb["password_enc"] = 30] = "password_enc";
    isc_spb[isc_spb["command_line"] = 105] = "command_line";
    isc_spb[isc_spb["dbname"] = 106] = "dbname";
    isc_spb[isc_spb["verbose"] = 107] = "verbose";
    isc_spb[isc_spb["options"] = 108] = "options";
    isc_spb[isc_spb["address_path"] = 109] = "address_path";
    isc_spb[isc_spb["process_id"] = 110] = "process_id";
    isc_spb[isc_spb["trusted_auth"] = 111] = "trusted_auth";
    isc_spb[isc_spb["process_name"] = 112] = "process_name";
    isc_spb[isc_spb["trusted_role"] = 113] = "trusted_role";
    isc_spb[isc_spb["verbint"] = 114] = "verbint";
    isc_spb[isc_spb["auth_block"] = 115] = "auth_block";
    isc_spb[isc_spb["auth_plugin_name"] = 116] = "auth_plugin_name";
    isc_spb[isc_spb["auth_plugin_list"] = 117] = "auth_plugin_list";
    isc_spb[isc_spb["utf8_filename"] = 118] = "utf8_filename";
    isc_spb[isc_spb["client_version"] = 119] = "client_version";
    isc_spb[isc_spb["remote_protocol"] = 120] = "remote_protocol";
    isc_spb[isc_spb["host_name"] = 121] = "host_name";
    isc_spb[isc_spb["os_user"] = 122] = "os_user";
    isc_spb[isc_spb["config"] = 123] = "config";
    isc_spb[isc_spb["expected_db"] = 124] = "expected_db";
    isc_spb[isc_spb["connect_timeout"] = 57] = "connect_timeout";
    isc_spb[isc_spb["dummy_packet_interval"] = 58] = "dummy_packet_interval";
    isc_spb[isc_spb["sql_role_name"] = 60] = "sql_role_name";
    isc_spb[isc_spb["specific_auth_data"] = 111] = "specific_auth_data";
})(isc_spb = exports.isc_spb || (exports.isc_spb = {}));
/*****************************
 * Service action items      *
 *****************************/
var isc_action_svc;
(function (isc_action_svc) {
    isc_action_svc[isc_action_svc["backup"] = 1] = "backup";
    isc_action_svc[isc_action_svc["restore"] = 2] = "restore";
    isc_action_svc[isc_action_svc["repair"] = 3] = "repair";
    isc_action_svc[isc_action_svc["add_user"] = 4] = "add_user";
    isc_action_svc[isc_action_svc["delete_user"] = 5] = "delete_user";
    isc_action_svc[isc_action_svc["modify_user"] = 6] = "modify_user";
    isc_action_svc[isc_action_svc["display_user"] = 7] = "display_user";
    isc_action_svc[isc_action_svc["properties"] = 8] = "properties";
    isc_action_svc[isc_action_svc["add_license"] = 9] = "add_license";
    isc_action_svc[isc_action_svc["remove_license"] = 10] = "remove_license";
    isc_action_svc[isc_action_svc["db_stats"] = 11] = "db_stats";
    isc_action_svc[isc_action_svc["get_ib_log"] = 12] = "get_ib_log";
    isc_action_svc[isc_action_svc["get_fb_log"] = 12] = "get_fb_log";
    isc_action_svc[isc_action_svc["nbak"] = 20] = "nbak";
    isc_action_svc[isc_action_svc["nrest"] = 21] = "nrest";
    isc_action_svc[isc_action_svc["trace_start"] = 22] = "trace_start";
    isc_action_svc[isc_action_svc["trace_stop"] = 23] = "trace_stop";
    isc_action_svc[isc_action_svc["trace_suspend"] = 24] = "trace_suspend";
    isc_action_svc[isc_action_svc["trace_resume"] = 25] = "trace_resume";
    isc_action_svc[isc_action_svc["trace_list"] = 26] = "trace_list";
    isc_action_svc[isc_action_svc["set_mapping"] = 27] = "set_mapping";
    isc_action_svc[isc_action_svc["drop_mapping"] = 28] = "drop_mapping";
    isc_action_svc[isc_action_svc["display_user_adm"] = 29] = "display_user_adm";
    isc_action_svc[isc_action_svc["validate"] = 30] = "validate";
    isc_action_svc[isc_action_svc["last"] = 31] = "last"; // keep it last !
})(isc_action_svc = exports.isc_action_svc || (exports.isc_action_svc = {}));
/*****************************
* Service information items *
*****************************/
var isc_info_svc;
(function (isc_info_svc) {
    isc_info_svc[isc_info_svc["svr_db_info"] = 50] = "svr_db_info";
    isc_info_svc[isc_info_svc["get_license"] = 51] = "get_license";
    isc_info_svc[isc_info_svc["get_license_mask"] = 52] = "get_license_mask";
    isc_info_svc[isc_info_svc["get_config"] = 53] = "get_config";
    isc_info_svc[isc_info_svc["version"] = 54] = "version";
    isc_info_svc[isc_info_svc["server_version"] = 55] = "server_version";
    isc_info_svc[isc_info_svc["implementation"] = 56] = "implementation";
    isc_info_svc[isc_info_svc["capabilities"] = 57] = "capabilities";
    isc_info_svc[isc_info_svc["user_dbpath"] = 58] = "user_dbpath";
    isc_info_svc[isc_info_svc["get_env"] = 59] = "get_env";
    isc_info_svc[isc_info_svc["get_env_lock"] = 60] = "get_env_lock";
    isc_info_svc[isc_info_svc["get_env_msg"] = 61] = "get_env_msg";
    isc_info_svc[isc_info_svc["line"] = 62] = "line";
    isc_info_svc[isc_info_svc["to_eof"] = 63] = "to_eof";
    isc_info_svc[isc_info_svc["timeout"] = 64] = "timeout";
    isc_info_svc[isc_info_svc["get_licensed_users"] = 65] = "get_licensed_users";
    isc_info_svc[isc_info_svc["limbo_trans"] = 66] = "limbo_trans";
    isc_info_svc[isc_info_svc["running"] = 67] = "running";
    isc_info_svc[isc_info_svc["get_users"] = 68] = "get_users";
    isc_info_svc[isc_info_svc["auth_block"] = 69] = "auth_block";
    isc_info_svc[isc_info_svc["stdin"] = 78] = "stdin"; /* Returns maximum size of data, needed as stdin for service */
})(isc_info_svc = exports.isc_info_svc || (exports.isc_info_svc = {}));
/*****************************************
 * Parameters for isc_action_svc_backup  *
 *****************************************/
var isc_spb_bkp;
(function (isc_spb_bkp) {
    isc_spb_bkp[isc_spb_bkp["file"] = 5] = "file";
    isc_spb_bkp[isc_spb_bkp["factor"] = 6] = "factor";
    isc_spb_bkp[isc_spb_bkp["length"] = 7] = "length";
    isc_spb_bkp[isc_spb_bkp["skip_data"] = 8] = "skip_data";
    isc_spb_bkp[isc_spb_bkp["stat"] = 15] = "stat";
    isc_spb_bkp[isc_spb_bkp["keyholder"] = 16] = "keyholder";
    isc_spb_bkp[isc_spb_bkp["keyname"] = 17] = "keyname";
    isc_spb_bkp[isc_spb_bkp["crypt"] = 18] = "crypt";
    isc_spb_bkp[isc_spb_bkp["ignore_checksums"] = 1] = "ignore_checksums";
    isc_spb_bkp[isc_spb_bkp["ignore_limbo"] = 2] = "ignore_limbo";
    isc_spb_bkp[isc_spb_bkp["metadata_only"] = 4] = "metadata_only";
    isc_spb_bkp[isc_spb_bkp["no_garbage_collect"] = 8] = "no_garbage_collect";
    isc_spb_bkp[isc_spb_bkp["old_descriptions"] = 16] = "old_descriptions";
    isc_spb_bkp[isc_spb_bkp["non_transportable"] = 32] = "non_transportable";
    isc_spb_bkp[isc_spb_bkp["convert"] = 64] = "convert";
    isc_spb_bkp[isc_spb_bkp["expand"] = 128] = "expand";
    isc_spb_bkp[isc_spb_bkp["no_triggers"] = 32768] = "no_triggers";
    isc_spb_bkp[isc_spb_bkp["zip"] = 65536] = "zip";
})(isc_spb_bkp = exports.isc_spb_bkp || (exports.isc_spb_bkp = {}));
/* Common, structural codes */
/****************************/
(function (isc_info) {
    isc_info[isc_info["isc_info_end"] = 1] = "isc_info_end";
    isc_info[isc_info["isc_info_truncated"] = 2] = "isc_info_truncated";
    isc_info[isc_info["isc_info_error"] = 3] = "isc_info_error";
    isc_info[isc_info["isc_info_data_not_ready"] = 4] = "isc_info_data_not_ready";
    isc_info[isc_info["isc_info_length"] = 126] = "isc_info_length";
    isc_info[isc_info["isc_info_flag_end"] = 127] = "isc_info_flag_end";
})(isc_info = exports.isc_info || (exports.isc_info = {}));
//# sourceMappingURL=constants.js.map