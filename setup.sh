# !/bin/bash

GREEN='\033[1;32m'
DARK_GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

THRESHOLD=2/3
show_spinner() {
    local -r pid="${1}"
    local -r delay='0.75'
    local spinstr='\|/-'
    local temp
    while ps a | awk '{print $1}' | grep -q "${pid}"; do
        temp="${spinstr#?}"
        printf " [%c]  " "${spinstr}"
        spinstr=${temp}${spinstr%"${temp}"}
        sleep "${delay}"
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

if ! command -v bcadmin &>/dev/null; then
    echo "${RED}'bcadmin' (Byzcoin CLI) is needed to run this script. See the README for details about how to install bcadmin.${NC}"
    exit 1
fi

if [[ -z "${BC_ADMIN_ID}" ]]; then
    echo "${RED}You need to define the administrator key as env variable before running this script!${NC}"
    echo "export BC_ADMIN_ID=ed25519:3b9637....."
    exit 1
fi

if [[ -z "${BC}" ]]; then
    echo "${RED}You need to define the Byzcoin config path as env variable before running this script!${NC}"
    echo 'export BC="/path/to/.../bc-ce98bc8ac...bed4038.cfg"'
    exit 1
fi

echo "${GREEN}"
echo "ICBfXyAgX18gICAgICAgICAgXyAgICAgIF8gICAgICAgICAgIF8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKIHwgIFwvICB8ICAgICAgICB8IHwgICAgfCB8ICAgICAgICAgKF8pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKIHwgXCAgLyB8IF9fXyAgX198IHwgX19ffCB8X18gICBfXyBfIF8gXyBfXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKIHwgfFwvfCB8LyBfIFwvIF9gIHwvIF9ffCAnXyBcIC8gX2AgfCB8ICdfIFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKIHwgfCAgfCB8ICBfXy8gKF98IHwgKF9ffCB8IHwgfCAoX3wgfCB8IHwgfCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKIHxffCAgfF98XF9fX3xcX18sX3xcX19ffF98IHxffFxfXyxffF98X3wgfF98ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICBfICAgICAgICAgICBfICAgICAgIF8gICAgIF8gICAgICAgICAgICAgXyAgIF8gICAgICAgICAgICAgICAgX19fX18gX19fX19fIF9fX19fX18gXyAgICBfIF9fX19fICAKICAgICAvXCAgICAgIHwgfCAgICAgICAgIChfKSAgICAgKF8pICAgfCB8ICAgICAgICAgICB8IHwgKF8pICAgICAgICAgICAgICAvIF9fX198ICBfX19ffF9fICAgX198IHwgIHwgfCAgX18gXCAKICAgIC8gIFwgICBfX3wgfF8gX18gX19fICBfIF8gX18gIF8gX19ffCB8XyBfIF9fIF9fIF98IHxfIF8gIF9fXyAgXyBfXyAgIHwgKF9fXyB8IHxfXyAgICAgfCB8ICB8IHwgIHwgfCB8X18pIHwKICAgLyAvXCBcIC8gX2AgfCAnXyBgIF8gXHwgfCAnXyBcfCAvIF9ffCBfX3wgJ19fLyBfYCB8IF9ffCB8LyBfIFx8ICdfIFwgICBcX19fIFx8ICBfX3wgICAgfCB8ICB8IHwgIHwgfCAgX19fLyAKICAvIF9fX18gXCAoX3wgfCB8IHwgfCB8IHwgfCB8IHwgfCBcX18gXCB8X3wgfCB8IChffCB8IHxffCB8IChfKSB8IHwgfCB8ICBfX19fKSB8IHxfX19fICAgfCB8ICB8IHxfX3wgfCB8ICAgICAKIC9fLyAgICBcX1xfXyxffF98IHxffCB8X3xffF98IHxffF98X19fL1xfX3xffCAgXF9fLF98XF9ffF98XF9fXy98X3wgfF98IHxfX19fXy98X19fX19ffCAgfF98ICAgXF9fX18vfF98ICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA=" | base64 --decode
echo "${NC}"

echo "${GREEN}## setting up rules for evolving the administration darc ##${NC}"
echo "${DARK_GREEN}Adding rule invoke:darc.evolve${NC}"
bcadmin darc rule --rule invoke:darc.evolve -id "threshold<${THRESHOLD},${BC_ADMIN_ID}>" --replace &
show_spinner "$!"
echo

echo "${GREEN}## setting up rules for spawning deferred transactions ##${NC}"
echo "${DARK_GREEN}Adding rule spawn:deferred${NC}"
bcadmin darc rule --rule spawn:deferred -id "${BC_ADMIN_ID}" &
show_spinner "$!"
echo "${DARK_GREEN}Adding rule invoke:deferred.addProof${NC}"
bcadmin darc rule --rule invoke:deferred.addProof -id "${BC_ADMIN_ID}" &
show_spinner "$!"
echo "${DARK_GREEN}Adding rule invoke:deferred.execProposedTx${NC}"
bcadmin darc rule --rule invoke:deferred.execProposedTx -id "${BC_ADMIN_ID}" &
show_spinner "$!"
echo

echo "${GREEN}## setting up rules for spawning projects contracts ##${NC}"
echo "${DARK_GREEN}Adding rule spawn:project${NC}"
bcadmin darc rule --rule spawn:project -id "threshold<${THRESHOLD},${BC_ADMIN_ID}>" &
show_spinner "$!"
echo "${DARK_GREEN}Adding rule invoke:project.add${NC}"
bcadmin darc rule --rule invoke:project.add -id "threshold<${THRESHOLD},${BC_ADMIN_ID}>" &
show_spinner "$!"
echo "${DARK_GREEN}Adding rule invoke:project.remove${NC}"
bcadmin darc rule --rule invoke:project.remove -id "threshold<${THRESHOLD},${BC_ADMIN_ID}>" &
show_spinner "$!"
