export type LocalizedText = {
    zh: string;
    en: string;
};

export type SetupStepId = 'profile' | 'assets' | 'sources' | 'import' | 'preview';
export type SetupProfileId = 'student' | 'working' | 'founder' | 'family' | 'global';
export type SetupAssetId = 'bank' | 'wallet' | 'broker' | 'property' | 'vehicle';
export type SetupSpreadId = 'few' | 'some' | 'many';
export type SetupInstitutionGroup = 'bank' | 'wallet' | 'broker';
export type SetupInstitutionId =
    | 'cba'
    | 'anz'
    | 'westpac'
    | 'nab'
    | 'st-george'
    | 'macquarie'
    | 'ing'
    | 'ubank'
    | 'bankwest'
    | 'hsbc'
    | 'boc'
    | 'alipay'
    | 'wechat'
    | 'ibkr'
    | 'moomoo';

export type SetupStepMeta = {
    id: SetupStepId;
    label: LocalizedText;
    short: LocalizedText;
};

export type SetupProfileOption = {
    id: SetupProfileId;
    title: LocalizedText;
    note: LocalizedText;
    helper: LocalizedText;
};

export type SetupAssetOption = {
    id: SetupAssetId;
    title: LocalizedText;
    note: LocalizedText;
    gate: 'core' | 'plus';
};

export type SetupSpreadOption = {
    id: SetupSpreadId;
    title: LocalizedText;
    note: LocalizedText;
};

export type SetupInstitution = {
    id: SetupInstitutionId;
    group: SetupInstitutionGroup;
    title: LocalizedText;
    note: LocalizedText;
    accent: string;
    surface: string;
    keywords: string[];
};

export const SETUP_STEPS: SetupStepMeta[] = [
    {
        id: 'profile',
        label: { zh: '画像', en: 'PROFILE' },
        short: { zh: '先认识你', en: 'Know you' },
    },
    {
        id: 'assets',
        label: { zh: '资产', en: 'ASSETS' },
        short: { zh: '先选类型', en: 'Choose types' },
    },
    {
        id: 'sources',
        label: { zh: '机构', en: 'SOURCES' },
        short: { zh: '再选来源', en: 'Pick sources' },
    },
    {
        id: 'import',
        label: { zh: '导入', en: 'IMPORT' },
        short: { zh: '准备截图', en: 'Queue files' },
    },
    {
        id: 'preview',
        label: { zh: '预览', en: 'PREVIEW' },
        short: { zh: '确认零值桌面', en: 'Check preview' },
    },
];

export const PROFILE_OPTIONS: SetupProfileOption[] = [
    {
        id: 'student',
        title: { zh: '学生 / 留学生活', en: 'Student' },
        note: { zh: '账户不算少，但最怕信息分散。', en: 'Balances are scattered and should feel simpler.' },
        helper: { zh: '适合多币种、银行卡和钱包混用。', en: 'Good for mixed currencies, cards, and wallets.' },
    },
    {
        id: 'working',
        title: { zh: '上班族 / 专业人士', en: 'Working professional' },
        note: { zh: '工资、储蓄和投资需要放回同一张桌面。', en: 'Salary, savings, and investing should share one surface.' },
        helper: { zh: '更看重每月稳不稳。', en: 'Usually cares most about monthly stability.' },
    },
    {
        id: 'founder',
        title: { zh: '自由职业 / 创业者', en: 'Founder / freelance' },
        note: { zh: '入口多，切换快，不能每次都手动整理。', en: 'More moving pieces, faster context switches.' },
        helper: { zh: '适合先抓大账户和安全线。', en: 'Best to spotlight large balances and runway first.' },
    },
    {
        id: 'family',
        title: { zh: '家庭管理 / 双人生活', en: 'Family planner' },
        note: { zh: '更需要看清固定支出和共同资金。', en: 'Needs a calmer view of shared money and fixed costs.' },
        helper: { zh: '预算提醒会更重要。', en: 'Budget guidance matters more here.' },
    },
    {
        id: 'global',
        title: { zh: '双地生活 / 跨境资产', en: 'Global life' },
        note: { zh: '银行、券商和多币种账户很容易分散。', en: 'Cross-border assets tend to fragment quickly.' },
        helper: { zh: '先统一币种和大额入口。', en: 'Unify currencies and major accounts first.' },
    },
];

export const ASSET_OPTIONS: SetupAssetOption[] = [
    {
        id: 'bank',
        title: { zh: '银行卡 / 手机银行', en: 'Banks and cards' },
        note: { zh: '工资卡、储蓄卡、多币种卡。', en: 'Salary, savings, and multicurrency cards.' },
        gate: 'core',
    },
    {
        id: 'wallet',
        title: { zh: '微信 / 支付宝 / 钱包', en: 'Wallets' },
        note: { zh: '微信零钱、支付宝余额、电子钱包。', en: 'WeChat, Alipay, and stored-value wallets.' },
        gate: 'core',
    },
    {
        id: 'broker',
        title: { zh: '券商 / 投资账户', en: 'Broker accounts' },
        note: { zh: 'IBKR、Moomoo 这类投资入口。', en: 'IBKR, Moomoo, and other broker balances.' },
        gate: 'core',
    },
    {
        id: 'property',
        title: { zh: '房产', en: 'Property' },
        note: { zh: '作为扩展资产模板，试用后放到 Plus。', en: 'Comes in as an expanded template after trial.' },
        gate: 'plus',
    },
    {
        id: 'vehicle',
        title: { zh: '车产', en: 'Vehicle' },
        note: { zh: '和房产一样，先作为扩展位保留。', en: 'Also kept as an expanded slot after trial.' },
        gate: 'plus',
    },
];

export const SPREAD_OPTIONS: SetupSpreadOption[] = [
    {
        id: 'few',
        title: { zh: '1 到 3 个入口', en: '1 to 3 places' },
        note: { zh: '比较集中，适合先快速起步。', en: 'Fairly compact, good for a fast start.' },
    },
    {
        id: 'some',
        title: { zh: '4 到 6 个入口', en: '4 to 6 places' },
        note: { zh: '已经开始分散，需要更强的归拢。', en: 'Already fragmented enough to need structure.' },
    },
    {
        id: 'many',
        title: { zh: '7 个以上', en: '7+ places' },
        note: { zh: '更适合先做一次集中导入。', en: 'Better handled with a concentrated intake pass.' },
    },
];

export const SETUP_INSTITUTIONS: SetupInstitution[] = [
    {
        id: 'cba',
        group: 'bank',
        title: { zh: 'CommBank / CBA', en: 'CommBank / CBA' },
        note: { zh: '澳洲常见主账户', en: 'Core Australian everyday banking' },
        accent: '#F7C948',
        surface: '#FFF3C4',
        keywords: ['commbank', 'commonwealth', 'cba', 'smart access', 'netbank'],
    },
    {
        id: 'anz',
        group: 'bank',
        title: { zh: 'ANZ', en: 'ANZ' },
        note: { zh: '偏冷蓝的主银行模板', en: 'Cool blue retail banking template' },
        accent: '#0A6BCE',
        surface: '#DCEEFF',
        keywords: ['anz', 'australia and new zealand bank'],
    },
    {
        id: 'westpac',
        group: 'bank',
        title: { zh: 'Westpac', en: 'Westpac' },
        note: { zh: '澳洲红系主银行模板', en: 'Red-led Australian major bank' },
        accent: '#D71920',
        surface: '#FFE3E6',
        keywords: ['westpac'],
    },
    {
        id: 'nab',
        group: 'bank',
        title: { zh: 'NAB', en: 'NAB' },
        note: { zh: 'National Australia Bank', en: 'National Australia Bank' },
        accent: '#C41230',
        surface: '#FFE1E7',
        keywords: ['nab', 'national australia bank'],
    },
    {
        id: 'st-george',
        group: 'bank',
        title: { zh: 'St.George', en: 'St.George' },
        note: { zh: '偏红白的支行体系', en: 'White and red branch banking look' },
        accent: '#C21F26',
        surface: '#FFE3E0',
        keywords: ['st.george', 'st george'],
    },
    {
        id: 'macquarie',
        group: 'bank',
        title: { zh: 'Macquarie', en: 'Macquarie' },
        note: { zh: '深青蓝投资银行气质', en: 'Deeper teal-toned investment banking feel' },
        accent: '#004B5A',
        surface: '#D9F1F3',
        keywords: ['macquarie'],
    },
    {
        id: 'ing',
        group: 'bank',
        title: { zh: 'ING', en: 'ING' },
        note: { zh: '橙色系储蓄模板', en: 'Orange-led savings template' },
        accent: '#F36F21',
        surface: '#FFE7D5',
        keywords: ['ing'],
    },
    {
        id: 'ubank',
        group: 'bank',
        title: { zh: 'ubank', en: 'ubank' },
        note: { zh: '更鲜明的橙色数字银行', en: 'Bright orange digital banking' },
        accent: '#FF6A00',
        surface: '#FFE8D8',
        keywords: ['ubank'],
    },
    {
        id: 'bankwest',
        group: 'bank',
        title: { zh: 'Bankwest', en: 'Bankwest' },
        note: { zh: '偏明亮黄的次级主账户', en: 'Bright yellow secondary banking colourway' },
        accent: '#F1C40F',
        surface: '#FFF6C7',
        keywords: ['bankwest'],
    },
    {
        id: 'hsbc',
        group: 'bank',
        title: { zh: 'HSBC', en: 'HSBC' },
        note: { zh: '适合多币种账户', en: 'Useful for multicurrency account matching' },
        accent: '#DB0011',
        surface: '#FFE3E8',
        keywords: ['hsbc', 'premier', 'advance'],
    },
    {
        id: 'boc',
        group: 'bank',
        title: { zh: '中国银行', en: 'Bank of China' },
        note: { zh: '红色系中文银行模板', en: 'Chinese red retail banking template' },
        accent: '#C41230',
        surface: '#FFE5EA',
        keywords: ['中国银行', 'bank of china', 'boc', '长城电子借记卡'],
    },
    {
        id: 'alipay',
        group: 'wallet',
        title: { zh: '支付宝', en: 'Alipay' },
        note: { zh: '蓝色钱包模板', en: 'Blue wallet template' },
        accent: '#1677FF',
        surface: '#DDEBFF',
        keywords: ['支付宝', 'alipay'],
    },
    {
        id: 'wechat',
        group: 'wallet',
        title: { zh: '微信 / 微信零钱', en: 'WeChat Wallet' },
        note: { zh: '绿色钱包模板', en: 'Green wallet template' },
        accent: '#1AAD19',
        surface: '#DDF7DE',
        keywords: ['微信', '微信零钱', 'wechat'],
    },
    {
        id: 'ibkr',
        group: 'broker',
        title: { zh: 'Interactive Brokers', en: 'Interactive Brokers' },
        note: { zh: '券商账户模板', en: 'Broker account template' },
        accent: '#C62857',
        surface: '#FFE1EA',
        keywords: ['interactive brokers', 'ibkr'],
    },
    {
        id: 'moomoo',
        group: 'broker',
        title: { zh: 'Moomoo', en: 'Moomoo' },
        note: { zh: '偏橘红的投资账户模板', en: 'Orange-red investing template' },
        accent: '#FF6A3D',
        surface: '#FFE6DD',
        keywords: ['moomoo'],
    },
];

export const SETUP_SAFETY_RULES: LocalizedText[] = [
    {
        zh: '不要上传安全码 CVV。',
        en: 'Do not upload your card security code (CVV).',
    },
    {
        zh: '不要上传密码、验证码或动态口令。',
        en: 'Do not upload passwords, OTP codes, or dynamic passcodes.',
    },
    {
        zh: '不要上传完整登录页，只保留余额、尾号和机构名。',
        en: 'Do not upload full login screens. Keep only balances, account endings, and institution names.',
    },
];

export const FREE_TRIAL_DAYS = 7;
export const FREE_UPLOAD_LIMIT = 3;
