export default function Header() {
    return (
        <header>
            <h1>不确定度计算器 v0.01</h1>
            <p className="info">使用前请先阅读：
                <ol>
                    <li>请手动将数据换算成国际单位制下的无量纲量，如 1 mm = 0.001 (m)，或者在输入栏中输入算式，此程序可自动计算；</li>
                    <li>在您的公式中，请勿使用 e、pi、Pi、N、D、ND 等有特殊含义的字符或者 Mu、Nu、Xi、Phi、Chi、Psi 等希腊字母的罗马音组合作为变量或者公式的部分，但是可以使用 e 和 pi、Pi 作为常量。</li>
                    <li>支持汉字和少量特殊字符作为变量使用，但请注意，本程序不支持分词，故词语会被拆解成单字；</li>
                    <li>目前网页为实时计算，可能会有延迟卡顿，如遇网页卡死，请关闭网页后重新打开；对于复杂公式的计算可能仍存在缺陷，计算结果仅供参考</li>
                    <li>如果在使用中遇到任何问题或发现程序产生错误的计算结果，欢迎到 <a href="https://github.com/HLXY-420/UncertaintyCalc/issues" target="_blank">GitHub Issues</a> 提出。</li>
                </ol>
            </p>
        </header>
    )
}