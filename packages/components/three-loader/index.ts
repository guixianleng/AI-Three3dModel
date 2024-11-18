import Loader from "./src/index.vue"
import { withInstall } from "@my-admin/utils"
import type { SFCWithInstall } from "@my-admin/utils"

const ThreeLoader: SFCWithInstall<typeof Chart> = withInstall(Loader)

export default ThreeLoader
