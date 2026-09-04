"use strict";

// 실제 정보를 입력할 때는 이 객체의 값만 바꾸면 됩니다.
// {{...}} 형식의 값은 화면에서 편집용 자리표시자로 표시됩니다.
const PROFILE = Object.freeze({
  name: "{{이름}}",
  targetCompany: "{{지원 회사}}",
  targetRole: "{{지원 직무}}",
  brandA: "{{브랜드A}}",
  brandB: "{{브랜드B}}",
  brandC: "{{브랜드C}}",
  signatureMaterial: "{{주력 소재·기법}}",
  signatureItem: "{{시그니처 아이템}}",
  repeatSeasons: "{{반복 전개 횟수}}",
  sellThrough: "{{판매율 성과}}",
  revenue: "{{매출 성과}}",
  wasteReduction: "{{로스 절감 수치}}",
  teamSize: "{{팀 규모}}",
  mentoringResult: "{{육성 사례}}",
  leadTime: "{{리드타임 개선}}",
  targetLine: "{{관심 제품·라인}}",
  productObservation: "{{구체적 관찰}}",
  improvementOpportunity: "{{개선 여지}}",
  phone: "{{연락처}}",
  email: "{{이메일}}",
  portfolioUrl: "{{포트폴리오 URL}}",
});

const PLACEHOLDER_PATTERN = /^\{\{(.+)\}\}$/;

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

function getFieldState(value) {
  const match = String(value).match(PLACEHOLDER_PATTERN);
  return {
    isPlaceholder: Boolean(match),
    displayValue: match ? match[1] : String(value),
  };
}

function normalizeExternalUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function setLinkState(element, fieldName, value, isPlaceholder) {
  if (!(element instanceof HTMLAnchorElement)) return;

  if (isPlaceholder) {
    element.removeAttribute("href");
    element.setAttribute("aria-disabled", "true");
    element.setAttribute("tabindex", "-1");
    return;
  }

  const linkByField = {
    email: `mailto:${value}`,
    phone: `tel:${value.replace(/[^\d+]/g, "")}`,
    portfolioUrl: normalizeExternalUrl(value),
  };

  element.href = linkByField[fieldName] ?? value;
  element.removeAttribute("aria-disabled");
  element.removeAttribute("tabindex");

  if (fieldName === "portfolioUrl") {
    element.target = "_blank";
    element.rel = "noreferrer";
  }
}

document.querySelectorAll("[data-field]").forEach((element) => {
  const fieldName = element.dataset.field;
  if (!fieldName || !(fieldName in PROFILE)) return;

  const value = PROFILE[fieldName];
  const { isPlaceholder, displayValue } = getFieldState(value);

  element.textContent = displayValue;
  element.classList.toggle("is-placeholder", isPlaceholder);

  if (isPlaceholder) {
    element.title = `${displayValue} 값을 script.js의 PROFILE 객체에 입력하세요.`;
  } else {
    element.removeAttribute("title");
  }

  if (element.dataset.linkField) {
    setLinkState(element, element.dataset.linkField, value, isPlaceholder);
  }
});

const nameState = getFieldState(PROFILE.name);
document.title = nameState.isPlaceholder
  ? "패션 디자이너 — 자기소개"
  : `${nameState.displayValue} — 패션 디자이너`;

const yearElement = document.querySelector("[data-current-year]");
if (yearElement) yearElement.textContent = String(new Date().getFullYear());

const navigationLinks = new Map(
  [...document.querySelectorAll("[data-section-link]")].map((link) => [
    link.dataset.sectionLink,
    link,
  ]),
);

function setCurrentSection(sectionId) {
  navigationLinks.forEach((link, id) => {
    if (id === sectionId) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) setCurrentSection(visibleEntry.target.id);
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.01, 0.15],
    },
  );

  navigationLinks.forEach((_, sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) observer.observe(section);
  });
}
