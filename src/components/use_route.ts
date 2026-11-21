import { useEffect, useState } from "react"

// The screens are picked by the part of the address after the #, which works on a
// static host with no server to route anything:
//   #/                   the chapters
//   #/chapter/c1         a chapter's lessons
//   #/lesson/c1/0        a lesson (the one after the last is the chapter's test)
//   #/progress           practice over the weeks
export type Route =
  | { screen: "home" }
  | { screen: "chapter", chapterId: string }
  | { screen: "lesson", chapterId: string, lessonIndex: number }
  | { screen: "progress" }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(p => p != "")
  if (parts[0] == "chapter" && parts[1]) {
    return { screen: "chapter", chapterId: parts[1] }
  }
  if (parts[0] == "lesson" && parts[1] && /^\d+$/.test(parts[2] ?? "")) {
    return { screen: "lesson", chapterId: parts[1], lessonIndex: Number(parts[2]) }
  }
  if (parts[0] == "progress") {
    return { screen: "progress" }
  }
  return { screen: "home" }
}

export function routeHash(route: Route): string {
  switch (route.screen) {
    case "home": return "#/"
    case "chapter": return `#/chapter/${route.chapterId}`
    case "lesson": return `#/lesson/${route.chapterId}/${route.lessonIndex}`
    case "progress": return "#/progress"
  }
}

export function go(route: Route) {
  window.location.hash = routeHash(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return route
}
