export interface AnswerOption {
  text: string;
  weights: string[]; // เก็บ ID ของ Character ที่จะได้คะแนนจากข้อนี้
}

export interface Question {
  id: number;
  text: string;
  options: AnswerOption[];
}

export const questionsData: Question[] = [
  {
    id: 1,
    text: "ถ้ามีคนทักมาคุย คุณจะชอบคนแบบไหนมากที่สุด?",
    options: [
      { text: "คำพูดสุภาพ อ่อนโยน", weights: ['goodguy', 'healer', 'secret'] },
      { text: "แต่งตัวดี มีออร่า", weights: ['cool', 'ceo', 'redflag'] },
      { text: "คุยสนุก เล่นมุกเก่ง", weights: ['funny', 'puppy', 'artist'] },
      { text: "ดูลึกลับ น่าค้นหา", weights: ['mystery', 'brainy', 'redflag'] }
    ]
  },
  {
    id: 2,
    text: "เดตแรกในฝันของคุณคือ",
    options: [
      { text: "เดินเล่นคาเฟ่ คุยกันยาว ๆ", weights: ['goodguy', 'artist', 'healer'] },
      { text: "ไปทำกิจกรรมมัน ๆ", weights: ['puppy', 'funny', 'cool'] },
      { text: "ดูคอนเสิร์ตหรือฟังดนตรี", weights: ['artist', 'puppy', 'redflag'] },
      { text: "นั่งชมวิวเงียบ ๆ", weights: ['mystery', 'brainy', 'ceo'] }
    ]
  },
  {
    id: 3,
    text: "ถ้าอีกฝ่ายตอบแชตช้า คุณจะคิดว่า...",
    options: [
      { text: "คงยุ่ง เดี๋ยวคงตอบ", weights: ['ceo', 'brainy', 'secret'] },
      { text: "เดี๋ยวก็มาเอง", weights: ['cool', 'funny', 'healer'] },
      { text: "เริ่มแต่งนิยายในหัวแล้ว", weights: ['mystery', 'redflag', 'puppy'] },
      { text: "ช่างมัน เราก็ใช้ชีวิตต่อ", weights: ['ceo', 'cool', 'brainy'] }
    ]
  },
  {
    id: 4,
    text: "อะไรทำให้คุณใจเต้นที่สุด?",
    options: [
      { text: "เขาจำเรื่องเล็ก ๆ ของเราได้", weights: ['goodguy', 'healer', 'secret'] },
      { text: "เขาดูมั่นใจ มีเสน่ห์", weights: ['cool', 'ceo', 'redflag'] },
      { text: "เขาทำให้เราหัวเราะ", weights: ['funny', 'puppy', 'artist'] },
      { text: "เขาเก่งและมีแพสชัน", weights: ['brainy', 'ceo', 'artist'] }
    ]
  },
  {
    id: 5,
    text: "เวลาเห็นคนที่แอบชอบ คุณมักจะ...",
    options: [
      { text: "ยิ้มแบบไม่รู้ตัว", weights: ['puppy', 'healer', 'secret'] },
      { text: "แอบมองก่อน", weights: ['mystery', 'brainy', 'goodguy'] },
      { text: "หาเรื่องเข้าไปคุย", weights: ['funny', 'cool', 'ceo'] },
      { text: "แกล้งทำเป็นไม่สนใจ", weights: ['redflag', 'mystery', 'cool'] }
    ]
  },
  {
    id: 6,
    text: "ถ้าเลือกได้ 1 ประโยค คำชมแบบไหนที่ฟังแล้วใจฟูที่สุด",
    options: [
      { text: "อยู่กับคุณด้วยแล้วสบายใจมากๆ", weights: ['goodguy', 'healer', 'secret'] },
      { text: "ถ้านี่ไม่ใช่คนที่เท่ที่สุด", weights: ['cool', 'artist', 'redflag'] },
      { text: "เก่งจัง อยากเก่งให้ได้แบบคุณบ้าง", weights: ['brainy', 'ceo', 'cool'] },
      { text: "ตลกมาก อยากอยู่ด้วยทั้งวันเลย", weights: ['funny', 'puppy', 'artist'] }
    ]
  },
  {
    id: 7,
    text: "ถ้าแฟนส่งข้อความมาว่า \"คิดถึง\" คุณจะ...",
    options: [
      { text: "รีบตอบกลับทันที", weights: ['puppy', 'goodguy', 'secret'] },
      { text: "แซวกลับก่อน", weights: ['funny', 'cool', 'artist'] },
      { text: "เขินแต่เก็บอาการ", weights: ['mystery', 'brainy', 'ceo'] },
      { text: "ส่งมีมกลับ", weights: ['funny', 'artist', 'redflag'] }
    ]
  },
  {
    id: 8,
    text: "เลือกประโยคที่ตรงใจที่สุด",
    options: [
      { text: "รักคือความสบายใจ", weights: ['goodguy', 'healer', 'secret'] },
      { text: "รักต้องมีความตื่นเต้น", weights: ['cool', 'redflag', 'ceo'] },
      { text: "รักต้องหัวเราะไปด้วยกัน", weights: ['funny', 'puppy', 'artist'] },
      { text: "รักคือการค่อย ๆ ทำความรู้จัก", weights: ['mystery', 'brainy', 'goodguy'] }
    ]
  }
];