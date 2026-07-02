

export const FONT_OPTIONS: any[] = [
  { name: 'Inter', displayName: '现代无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap' },
  { name: 'DM Sans', displayName: 'DM 无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' },
  { name: 'Overpass', displayName: '圆润无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Overpass:wght@100..900&display=swap' },
  { name: 'Barlow', displayName: '商务窄体', cssUrl: 'https://fonts.googleapis.com/css2?family=Barlow:wght@100..900&display=swap' },
  { name: 'Nunito', displayName: '亲和圆体', cssUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@200..1000&display=swap' },
  { name: 'Lora', displayName: '优雅衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' },
  { name: 'Instrument Sans', displayName: '专业无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap' },
  { name: 'Roboto Slab', displayName: 'Roboto 粗衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap' },
  { name: 'Montserrat', displayName: '现代标题体', cssUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap' },
  { name: 'Libre Baskerville', displayName: '经典衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap' },
  { name: 'Prompt', displayName: '清爽几何体', cssUrl: 'https://fonts.googleapis.com/css2?family=Prompt:wght@100..900&display=swap' },
  { name: 'Inconsolata', displayName: '等宽代码体', cssUrl: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&display=swap' },
  { name: 'Fraunces', displayName: '复古展示体', cssUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@300..900&display=swap' },
  { name: 'Gelasio', displayName: '典雅正文体', cssUrl: 'https://fonts.googleapis.com/css2?family=Gelasio:wght@300..700&display=swap' },
  { name: 'Raleway', displayName: '轻盈无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100..900&display=swap' },
  { name: 'Kanit', displayName: '科技无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Kanit:wght@100..900&display=swap' },
  { name: 'Corben', displayName: '圆润展示体', cssUrl: 'https://fonts.googleapis.com/css2?family=Corben:wght@400;700&display=swap' },
  { name: 'Poppins', displayName: '几何无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap' },
  { name: 'Open Sans', displayName: '开放无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap' },
  { name: 'Lato', displayName: '简洁商务体', cssUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@100..900&display=swap' },
  { name: 'Source Sans Pro', displayName: '思源西文无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@200..900&display=swap' },
  { name: 'Playfair Display', displayName: '优雅展示衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&display=swap' },
  { name: 'Roboto', displayName: 'Roboto 无衬线', cssUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap' }
]

export const DEFAULT_THEMES: any[] = [
  {
    id: "edge-yellow",
    name: "锐利黄黑",
    description: "适合高对比、醒目风格的黄黑主题。",
    logo: null,
    logo_url: null,
    company_name: null,

    data: {
      colors: {
        primary: "#f5f547",
        background: "#1f1f1f",
        card: "#424242",
        stroke: "#585858",
        primary_text: "#161616",
        background_text: "#f5f547",
        graph_0: "#ffff54",
        graph_1: "#f1f142",
        graph_2: "#dada15",
        graph_3: "#c1bf00",
        graph_4: "#a8a600",
        graph_5: "#908c00",
        graph_6: "#797400",
        graph_7: "#625c00",
        graph_8: "#4d4500",
        graph_9: "#382f00"
      },
      fonts: {
        textFont: {
          name: "Playfair Display",
          url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&display=swap"
        }
      }
    }
  },
  {
    id: "light-rose",
    name: "浅玫瑰",
    description: "柔和玫瑰色背景，适合轻快醒目的演示。",
    logo: null,
    logo_url: null,
    company_name: null,

    data: {
      colors: {
        "primary": "#030204",
        background: "#f69c9c",
        card: "#ffaeb4",
        stroke: "#bf6a6b",
        primary_text: "#bebebe",
        background_text: "#030202",
        graph_0: "#2f2c32",
        graph_1: "#444147",
        graph_2: "#5a565d",
        graph_3: "#706d73",
        graph_4: "#88848b",
        graph_5: "#a09da4",
        graph_6: "#b9b6bd",
        graph_7: "#d3cfd6",
        graph_8: "#eae6ed",
        graph_9: "#f7f3fb"
      },
      fonts: {
        textFont: {
          name: "Overpass",
          url: "https://fonts.googleapis.com/css2?family=Overpass:wght@100..900&display=swap"
        }
      }
    }
  },
  {
    id: "mint-blue",
    name: "薄荷蓝",
    description: "薄荷绿卡片搭配蓝紫标题的清爽主题。",
    logo: null,
    logo_url: null,
    company_name: null,

    data: {
      colors: {
        primary: "#3b3172",
        background: "#ffffff",
        card: "#80e7cf",
        stroke: "#d1d1d1",
        primary_text: "#ffffff",
        background_text: "#3b3172",
        graph_0: "#003d2d",
        graph_1: "#005341",
        graph_2: "#006a57",
        graph_3: "#00826d",
        graph_4: "#2b9a85",
        graph_5: "#4ab39d",
        graph_6: "#65cdb6",
        graph_7: "#80e7cf",
        graph_8: "#98ffe6",
        graph_9: "#a5fff4"
      },
      fonts: {
        textFont: {
          name: "Prompt",
          url: "https://fonts.googleapis.com/css2?family=Prompt:wght@100..900&display=swap"
        }
      }
    }
  },
  {
    id: "professional-blue",
    name: "专业蓝",
    description: "干净稳重的专业蓝色商务主题。",
    logo: null,
    logo_url: null,
    company_name: null,

    data: {
      colors: {
        primary: "#161616",
        background: "#ffffff",
        card: "#dae6ff",
        stroke: "#d1d1d1",
        primary_text: "#eeeaea",
        background_text: "#000000",
        graph_0: "#2e2e2e",
        graph_1: "#424242",
        graph_2: "#585858",
        graph_3: "#6f6f6f",
        graph_4: "#868686",
        graph_5: "#9e9e9e",
        graph_6: "#b7b7b7",
        graph_7: "#d1d1d1",
        graph_8: "#e8e8e8",
        graph_9: "#f5f5f5"
      },
      fonts: {
        textFont: {
          name: "Inter",
          url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        }
      }
    }
  },
  {
    id: "professional-dark",
    name: "专业深色",
    description: "适合深色商务汇报的专业主题。",
    logo: null,
    logo_url: null,
    company_name: null,

    data: {
      colors: {
        primary: "#eff5f1",
        background: "#050505",
        card: "#424242",
        stroke: "#585858",
        primary_text: "#050505",
        background_text: "#eff5f1",
        graph_0: "#ebf6ff",
        graph_1: "#dee8fa",
        graph_2: "#c7d2e3",
        graph_3: "#aeb8c9",
        graph_4: "#959fb0",
        graph_5: "#7d8797",
        graph_6: "#666f7f",
        graph_7: "#505867",
        graph_8: "#3a4351",
        graph_9: "#262e3c"
      },
      fonts: {
        textFont: {
          name: "Instrument Sans",
          url: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
        }
      }
    }
  }
]
