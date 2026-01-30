
import fs from 'fs';
import path from 'path';

const models = [
  {
    id: "condition-mapping",
    title: "条件落图",
    goal: "看到文字条件，必须立刻在图上做标记，不漏任何一个。",
    steps: [
      { svg: "step-1.svg", caption: "读一句", tip: "眼睛看题目：'AB = AC'" },
      { svg: "step-2.svg", caption: "画一笔", tip: "手在图上画：给 AB 和 AC 打上等腰标记" },
      { svg: "step-3.svg", caption: "条件不丢", tip: "再读：'∠A=60°'，马上在角A处标上60度" },
      { svg: "step-4.svg", caption: "才合理", tip: "只有把条件都‘搬’到图上，大脑才能思考！" }
    ],
    check: {
        question: "如果题目说‘BD平分∠ABC’，你应该立刻在图上做什么？",
        options: ["读下一句", "在∠ABD和∠CBD处标上相等的角符号", "列出方程"],
        answer: "在∠ABD和∠CBD处标上相等的角符号"
    }
  },
  {
    id: "parallel-angles",
    title: "平行线角关系",
    goal: "看到平行线，马上找到 Z型、F型、U型 角。",
    steps: [
      { svg: "step-1.svg", caption: "两直线平行", tip: "找到题目中的平行线 AB // CD" },
      { svg: "step-2.svg", caption: "找 Z 型", tip: "沿着截线找‘Z’字，内错角相等！" },
      { svg: "step-3.svg", caption: "找 F 型", tip: "沿着截线找‘F’字，同位角相等！" },
      { svg: "step-4.svg", caption: "找 U 型", tip: "沿着截线找‘U’字，同旁内角互补！" }
    ],
    check: {
        question: "看到平行线和截线组成的'Z'字形，哪对角相等？",
        options: ["同位角", "内错角", "同旁内角"],
        answer: "内错角"
    }
  },
  {
    id: "congruence-trigger",
    title: "全等触发",
    goal: "要证全等，就像‘集齐龙珠’，必须凑够三个条件。",
    steps: [
      { svg: "step-1.svg", caption: "三边三角", tip: "盯着两个三角形，心里列清单：边、角、边..." },
      { svg: "step-2.svg", caption: "凑三个", tip: "已知 AB=DE (1)，∠B=∠E (2)，还差一个！" },
      { svg: "step-3.svg", caption: "全等判定", tip: "找到 BC=EF (3)！SAS 达成！" },
      { svg: "step-4.svg", caption: "跑不脱", tip: "三个条件一齐，全等立刻成立！" }
    ],
    check: {
        question: "证明全等至少需要几个条件（其中至少一个是边）？",
        options: ["1个", "2个", "3个"],
        answer: "3个"
    }
  },
  {
    id: "midpoint-model",
    title: "中点模型",
    goal: "看到中点，条件反射想到‘倍长中线’或‘中位线’。",
    steps: [
      { svg: "step-1.svg", caption: "见中点", tip: "题目给了 D 是 BC 中点，太孤单了。" },
      { svg: "step-2.svg", caption: "想倍长", tip: "延长 AD 到 E，让 DE = AD。" },
      { svg: "step-3.svg", caption: "构造全等", tip: "连接 BE，瞬间造出 △ADC ≌ △EDB。" },
      { svg: "step-4.svg", caption: "帮帮忙", tip: "原本不挨着的边和角，现在全转移过来了！" }
    ],
    check: {
        question: "倍长中线后，通常能得到什么关系？",
        options: ["全等三角形", "相似三角形", "直角三角形"],
        answer: "全等三角形"
    }
  },
  {
    id: "two-step-gap",
    title: "两步题断层",
    goal: "条件 A 推不出结论 B？中间缺个‘桥’！",
    steps: [
      { svg: "step-1.svg", caption: "问题两头堵", tip: "已知 A，想求 B，直接推推不动？" },
      { svg: "step-2.svg", caption: "中间找个土", tip: "找一个中间量 C（桥梁）。" },
      { svg: "step-3.svg", caption: "两步", tip: "先由 A 推出 C，再由 C 推出 B。" },
      { svg: "step-4.svg", caption: "变一步", tip: "把复杂的逻辑拆成两个简单的单步！" }
    ],
    check: {
        question: "当已知条件推不出结论时，应该？",
        options: ["放弃", "寻找中间量（搭桥）", "乱猜"],
        answer: "寻找中间量（搭桥）"
    }
  }
];

const baseDir = path.join(process.cwd(), 'public', 'models');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

models.forEach(model => {
  const modelDir = path.join(baseDir, model.id);
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  // Write steps.json
  fs.writeFileSync(path.join(modelDir, 'steps.json'), JSON.stringify(model, null, 2));

  // Create dummy SVGs
  model.steps.forEach(step => {
    const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#475569">
    ${model.title} - ${step.caption}
  </text>
  <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#94a3b8">
    (示意图: ${step.tip})
  </text>
</svg>`;
    fs.writeFileSync(path.join(modelDir, step.svg), svgContent);
  });
  
  console.log(`Created model: ${model.id}`);
});
