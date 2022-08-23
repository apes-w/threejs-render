module.exports = {
    "root": true,
    "parserOptions": {
        "sourceType": 'module',
        "ecmaVersion": "2020",
    },
    "env": {
        "browser": true,
    },
    // "extends": "eslint:recommended",
    // "overrides": [
    // ],
    // "parserOptions": {
    //     "ecmaVersion": "latest",
    //     "sourceType": "module"
    // },
    "rules": {
        "no-cond-assign": 2, //条件语句的条件中不允许出现赋值运算符
        "no-dupe-args": 2, //函数定义的时候不允许出现重复的参数
        "no-dupe-keys": 2, //对象中不允许出现重复的键
        "no-duplicate-case": 2, //switch语句中不允许出现重复的case标签
        "no-empty": 2, //不允许出现空的代码块
        "no-var": 0, //使用let和const代替var
        "no-new-object": 2, //禁止使用new Object()
        "new-cap": [2, {"newIsCap": true, "capIsNew": false}], //构造函数名字首字母要大写
        "radix": 1, //使用parseInt时强制使用基数来指定是十进制还是其他进制
        "no-throw-literal": 2, //不允许抛出字面量错误 throw "error"
        "no-redeclare": 2, //不允许变量重复声明
        "no-multi-spaces": 2, //不允许出现多余的空格
        "no-multiple-empty-lines": [2, {"max": 2}], //空行最多不能超过两行
        "semi": [1, 'always'], // 必须以分号结尾
        "quotes": [1, 'single'], // js中字符串用单引号
        "no-unused-vars": [1],
    }
}
