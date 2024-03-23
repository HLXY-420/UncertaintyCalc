export default function Header() {
    return (
        <header>
            <h1>不确定度计算器 v0.01</h1>
            <p>注意事项：请手动将数据换算成国际单位制下的无量纲量，如 1 mm = 0.001 (m)，或者在输入栏中输入算式，此程序可自动计算；
                <br />
                <span style={{ whiteSpace: 'pre-line' }}>当前版本尚不支持下标字符，不确定度传递公式可能显示有误，但是运算结果是正确的；</span>
                <br />
                <span style={{ whiteSpace: 'pre-line' }}>在您的公式中，请勿使用 e、pi、Pi、N、D、ND 等有特殊含义的字符或者 Mu、Nu、Xi、Phi、Chi、Psi 等希腊字母的罗马音组合作为变量或者公式的部分，但是可以使用 e 和 pi、Pi 作为常量。</span>
            </p>
        </header>
    )
}