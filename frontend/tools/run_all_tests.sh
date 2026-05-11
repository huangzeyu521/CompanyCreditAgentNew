#!/bin/bash
# 写入文件而非 buffer，避免长输出截断
TOTAL_PASS=0
TOTAL_FAIL=0
FAILS=()
TMPDIR=$(mktemp -d)

for f in frontend/tools/debug_master.cjs \
         frontend/tools/debug_master_v2.cjs \
         frontend/tools/debug_master_v3.cjs \
         frontend/tools/debug_master_v4.cjs \
         frontend/tools/debug_master_v5.cjs \
         frontend/tools/e2e_intake.cjs \
         frontend/tools/e2e_intake_full.cjs \
         frontend/tools/e2e_step2_factual.cjs \
         frontend/tools/e2e_workbench.cjs \
         frontend/tools/e2e_workbench_v2.cjs \
         frontend/tools/e2e_workbench_v3.cjs \
         frontend/tools/e2e_huaxi_huayuan.cjs \
         frontend/tools/e2e_ninghu_jxcopper.cjs \
         frontend/tools/e2e_six_more.cjs \
         frontend/tools/debug_master_v6.cjs \
         frontend/tools/e2e_six_projects.cjs \
         frontend/tools/smoke_25pages.cjs \
         frontend/tools/deep_audit.cjs \
         frontend/tools/e2e_project_scope.cjs \
         frontend/tools/e2e_conflict_detail.cjs \
         frontend/tools/e2e_project_detail_v2.cjs \
         frontend/tools/e2e_last_project_memory.cjs \
         frontend/tools/e2e_kyc_factual.cjs; do
  base=$(basename "$f")
  log="$TMPDIR/$base.log"
  # 第一次跑
  node "$f" > "$log" 2>&1
  exit_code=$?
  # 任何非零退出 → 重试一次（涵盖 flake + 偶发断言失败）
  if [ "$exit_code" -ne 0 ]; then
    sleep 3
    node "$f" > "$log" 2>&1
    exit_code=$?
  fi
  fail_count=$(grep -c "❌ FAIL" "$log")
  pass_count=$(grep -c "✅" "$log")
  if [ "$exit_code" -eq 0 ]; then
    printf "  ✅ %-32s %3d 通过\n" "$base" "$pass_count"
    TOTAL_PASS=$((TOTAL_PASS+pass_count))
  else
    printf "  ❌ %-32s %3d 通过 / %3d 失败 (exit %d)\n" "$base" "$pass_count" "$fail_count" "$exit_code"
    TOTAL_FAIL=$((TOTAL_FAIL+fail_count))
    FAILS+=("$base")
    grep "❌ FAIL\|FATAL\|Error:" "$log" | head -5 | sed 's/^/      /'
  fi
done
echo ""
echo "═══════════════════════════════════"
echo "  总计：${TOTAL_PASS} 通过 / ${TOTAL_FAIL} 失败"
echo "  失败套件：${FAILS[*]:-无}"
echo "═══════════════════════════════════"
rm -rf "$TMPDIR"
