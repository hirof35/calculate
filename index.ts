import * as readline from 'readline';

// readlineインターフェースの設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// コンソール入力を非同期で取得する補助関数
const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

// --- 計算ロジック ---

// 1. 質量パーセント濃度の計算 (%)
function calculateMassPercent(soluteMass: number, solventMass: number): number {
  const totalMass = soluteMass + solventMass;
  if (totalMass === 0) return 0;
  return (soluteMass / totalMass) * 100;
}

// 2. モル濃度の計算 (mol/L)
function calculateMolarity(soluteMass: number, molarMass: number, solutionVolumemL: number): number {
  if (molarMass === 0 || solutionVolumemL === 0) return 0;
  const moles = soluteMass / molarMass;
  const volumeL = solutionVolumemL / 1000;
  return moles / volumeL;
}

// 3. 希釈に必要な加水量の計算 (mL)
function calculateDilution(c1: number, v1: number, c2: number): number {
  if (c2 === 0 || c2 >= c1) return 0;
  const v2 = (c1 * v1) / c2;
  return v2 - v1; // 追加すべき溶媒の量
}

// --- メインアプリ ---

async function main() {
  console.log('====================================');
  console.log('  水溶液計算コンソールアプリ');
  console.log('====================================\n');

  while (true) {
    console.log('\n実行したい計算を選択してください:');
    console.log('1: 質量パーセント濃度 (%) の計算');
    console.log('2: モル濃度 (mol/L) の計算');
    console.log('3: 希釈計算 (必要な加水量の算出)');
    console.log('0: 終了');

    const choice = await askQuestion('\n選択 (0-3): ');

    if (choice === '0') {
      console.log('アプリケーションを終了します。');
      break;
    }

    switch (choice) {
      case '1': {
        console.log('\n--- 質量パーセント濃度の計算 ---');
        const solute = parseFloat(await askQuestion('溶質の質量 (g): '));
        const solvent = parseFloat(await askQuestion('溶媒(水)の質量 (g): '));

        if (isNaN(solute) || isNaN(solvent) || solute < 0 || solvent <= 0) {
          console.log('❌ 有効な数値を入力してください。');
          break;
        }

        const result = calculateMassPercent(solute, solvent);
        console.log(`\n✅ 質量パーセント濃度: ${result.toFixed(2)} %`);
        break;
      }

      case '2': {
        console.log('\n--- モル濃度の計算 ---');
        const solute = parseFloat(await askQuestion('溶質の質量 (g): '));
        const molarMass = parseFloat(await askQuestion('溶質のモル質量 (g/mol) [例: NaCl=58.44]: '));
        const volume = parseFloat(await askQuestion('水溶液の体積 (mL): '));

        if (isNaN(solute) || isNaN(molarMass) || isNaN(volume) || molarMass <= 0 || volume <= 0) {
          console.log('❌ 有効な数値を入力してください。');
          break;
        }

        const result = calculateMolarity(solute, molarMass, volume);
        console.log(`\n✅ モル濃度: ${result.toFixed(3)} mol/L`);
        break;
      }

      case '3': {
        console.log('\n--- 希釈計算 ---');
        const c1 = parseFloat(await askQuestion('元の濃度 (mol/L または %): '));
        const v1 = parseFloat(await askQuestion('元の液量 (mL): '));
        const c2 = parseFloat(await askQuestion('目標の濃度 (mol/L または %): '));

        if (isNaN(c1) || isNaN(v1) || isNaN(c2) || c2 >= c1 || c1 <= 0 || v1 <= 0 || c2 <= 0) {
          console.log('❌ 有効な数値を入力してください（目標濃度は元濃度より小さくする必要があります）。');
          break;
        }

        const waterToAdd = calculateDilution(c1, v1, c2);
        console.log(`\n✅ 追加すべき水の量: ${waterToAdd.toFixed(1)} mL`);
        console.log(`   (希釈後の全量: ${(v1 + waterToAdd).toFixed(1)} mL)`);
        break;
      }

      default:
        console.log('❌ 0から3の番号を選択してください。');
        break;
    }
  }

  rl.close();
}

main();