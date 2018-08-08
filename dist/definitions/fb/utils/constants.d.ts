export declare enum XpbBuilderParams {
    VERSION = 3,
    DPB = 1,
    SPB_ATTACH = 2,
    SPB_START = 3,
    TPB = 4,
    BATCH = 5,
    BPB = 6
}
/****************************/
export declare enum isc_info {
    end = 1,
    truncated = 2,
    error = 3,
    data_not_ready = 4,
    length = 126,
    flag_end = 127
}
/**********************************/
/**********************************/
export declare enum isc_dpb {
    version1 = 1,
    version2 = 2,
    cdd_pathname = 1,
    allocation = 2,
    journal = 3,
    page_size = 4,
    num_buffers = 5,
    buffer_length = 6,
    debug = 7,
    garbage_collect = 8,
    verify = 9,
    sweep = 10,
    enable_journal = 11,
    disable_journal = 12,
    dbkey_scope = 13,
    number_of_users = 14,
    trace = 15,
    no_garbage_collect = 16,
    damaged = 17,
    license = 18,
    sys_user_name = 19,
    encrypt_key = 20,
    activate_shadow = 21,
    sweep_interval = 22,
    delete_shadow = 23,
    force_write = 24,
    begin_log = 25,
    quit_log = 26,
    no_reserve = 27,
    user_name = 28,
    password = 29,
    password_enc = 30,
    sys_user_name_enc = 31,
    interp = 32,
    online_dump = 33,
    old_file_size = 34,
    old_num_files = 35,
    old_file = 36,
    old_start_page = 37,
    old_start_seqno = 38,
    old_start_file = 39,
    drop_walfile = 40,
    old_dump_id = 41,
    wal_backup_dir = 42,
    wal_chkptlen = 43,
    wal_numbufs = 44,
    wal_bufsize = 45,
    wal_grp_cmt_wait = 46,
    lc_messages = 47,
    lc_ctype = 48,
    cache_manager = 49,
    shutdown = 50,
    online = 51,
    shutdown_delay = 52,
    reserved = 53,
    overwrite = 54,
    sec_attach = 55,
    disable_wal = 56,
    connect_timeout = 57,
    dummy_packet_interval = 58,
    gbak_attach = 59,
    sql_role_name = 60,
    set_page_buffers = 61,
    working_directory = 62,
    sql_dialect = 63,
    set_db_readonly = 64,
    set_db_sql_dialect = 65,
    gfix_attach = 66,
    gstat_attach = 67,
    set_db_charset = 68,
    gsec_attach = 69,
    address_path = 70,
    process_id = 71,
    no_db_triggers = 72,
    trusted_auth = 73,
    process_name = 74,
    trusted_role = 75,
    org_filename = 76,
    utf8_filename = 77,
    ext_call_depth = 78,
    auth_block = 79,
    client_version = 80,
    remote_protocol = 81,
    host_name = 82,
    os_user = 83,
    specific_auth_data = 84,
    auth_plugin_list = 85,
    auth_plugin_name = 86,
    config = 87,
    nolinger = 88,
    reset_icu = 89,
    map_attach = 90
}
export declare enum tpb {
    isc_tpb_version1 = 1,
    isc_tpb_consistency = 1,
    isc_tpb_concurrency = 2,
    isc_tpb_wait = 6,
    isc_tpb_nowait = 7,
    isc_tpb_read = 8,
    isc_tpb_write = 9,
    isc_tpb_ignore_limbo = 14,
    isc_tpb_read_committed = 15,
    isc_tpb_autocommit = 16,
    isc_tpb_rec_version = 17,
    isc_tpb_no_rec_version = 18,
    isc_tpb_restart_requests = 19,
    isc_tpb_no_auto_undo = 20
}
/*********************************/
/*********************************/
export declare enum isc_spb {
    version1 = 1,
    current_version = 2,
    version = 2,
    version3 = 3,
    user_name = 28,
    sys_user_name = 19,
    sys_user_name_enc = 31,
    password = 29,
    password_enc = 30,
    command_line = 105,
    dbname = 106,
    verbose = 107,
    options = 108,
    address_path = 109,
    process_id = 110,
    trusted_auth = 111,
    process_name = 112,
    trusted_role = 113,
    verbint = 114,
    auth_block = 115,
    auth_plugin_name = 116,
    auth_plugin_list = 117,
    utf8_filename = 118,
    client_version = 119,
    remote_protocol = 120,
    host_name = 121,
    os_user = 122,
    config = 123,
    expected_db = 124,
    connect_timeout = 57,
    dummy_packet_interval = 58,
    sql_role_name = 60,
    specific_auth_data = 111
}
/*****************************
 * Service action items      *
 *****************************/
export declare enum isc_action_svc {
    backup = 1,
    restore = 2,
    repair = 3,
    add_user = 4,
    delete_user = 5,
    modify_user = 6,
    display_user = 7,
    properties = 8,
    add_license = 9,
    remove_license = 10,
    db_stats = 11,
    get_ib_log = 12,
    get_fb_log = 12,
    nbak = 20,
    nrest = 21,
    trace_start = 22,
    trace_stop = 23,
    trace_suspend = 24,
    trace_resume = 25,
    trace_list = 26,
    set_mapping = 27,
    drop_mapping = 28,
    display_user_adm = 29,
    validate = 30,
    last = 31
}
/*****************************
* Service information items *
*****************************/
export declare enum isc_info_svc {
    svr_db_info = 50,
    get_license = 51,
    get_license_mask = 52,
    get_config = 53,
    version = 54,
    server_version = 55,
    implementation = 56,
    capabilities = 57,
    user_dbpath = 58,
    get_env = 59,
    get_env_lock = 60,
    get_env_msg = 61,
    line = 62,
    to_eof = 63,
    timeout = 64,
    get_licensed_users = 65,
    limbo_trans = 66,
    running = 67,
    get_users = 68,
    auth_block = 69,
    stdin = 78
}
/*****************************************
 * Parameters for isc_action_svc_backup  *
 *****************************************/
export declare enum isc_spb_bkp {
    file = 5,
    factor = 6,
    length = 7,
    skip_data = 8,
    stat = 15,
    keyholder = 16,
    keyname = 17,
    crypt = 18,
    ignore_checksums = 1,
    ignore_limbo = 2,
    metadata_only = 4,
    no_garbage_collect = 8,
    old_descriptions = 16,
    non_transportable = 32,
    convert = 64,
    expand = 128,
    no_triggers = 32768,
    zip = 65536
}
/*****************************************
 * Parameters for isc_action_svc_restore *
 *****************************************/
export declare enum isc_spb_res {
    skip_data = 8,
    buffers = 9,
    page_size = 10,
    length = 11,
    access_mode = 12,
    fix_fss_data = 13,
    fix_fss_metadata = 14,
    deactivate_idx = 256,
    no_shadow = 512,
    no_validity = 1024,
    one_at_a_time = 2048,
    replace = 4096,
    create = 8192,
    use_all_space = 16384
}
/****************************/
export declare enum isc_info {
    isc_info_end = 1,
    isc_info_truncated = 2,
    isc_info_error = 3,
    isc_info_data_not_ready = 4,
    isc_info_length = 126,
    isc_info_flag_end = 127
}
