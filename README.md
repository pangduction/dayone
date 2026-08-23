# Daypic (Expo / React Native)

Figma MCP를 이용해 디자인을 코드로 옮기며 개발하는 프로젝트입니다.

- 디자인: [Daypic 기획 (Figma)](https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/Daypic-기획-)
- 스택: Expo + React Native + TypeScript

## 실행

```bash
npm install
npm run start   # 또는 npm run ios / npm run android / npm run web
```

## 구조

```
src/
  screens/     화면 단위 컴포넌트 (Figma 프레임 1개 ≈ 화면 1개)
  components/  재사용 컴포넌트 (Figma 컴포넌트에 대응)
  theme/       컬러/타이포그래피 등 디자인 토큰
  navigation/  화면 간 네비게이션 설정
```

## 워크플로

1. Figma에서 구현할 화면(프레임)의 링크를 `node-id`까지 포함해 전달
2. 디자인 내용을 읽어 해당 화면을 `src/screens/`에 구현
3. 반복되는 요소는 `src/components/`로 분리하고 `src/theme/tokens.ts`의 토큰을 사용
