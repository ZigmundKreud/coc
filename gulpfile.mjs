import gulp from "gulp"
import less from "gulp-less"

const LESS_DEST = "./css"
const LESS_SRC = "./styles/coc.less"
export const LESS_WATCH = ["./styles/**/*.less"]

/**
 * Compile the LESS sources into a single CSS file.
 */
function compileLESS() {
  return gulp.src(LESS_SRC).pipe(less()).pipe(gulp.dest(LESS_DEST))
}

export const css = gulp.series(compileLESS)

/**
 * Update the CSS if any of the LESS sources are modified.
 */
export function watchUpdates() {
  gulp.watch(LESS_WATCH, css)
}

// Default export - build CSS and watch for updates
export default gulp.series(compileLESS, watchUpdates)