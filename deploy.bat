@echo off
echo 正在准备部署到Vercel...

echo.
echo 当前项目文件：
dir /b *.html *.js *.css *.json

echo.
echo 请按照以下步骤操作：
echo.
echo 1. 确保所有文件已提交到GitHub：
echo    git add .
echo    git commit -m "Update project files"
echo    git push origin main
echo.
echo 2. 在Vercel控制台中：
echo    - 访问 https://vercel.com/dashboard
echo    - 选择您的 momentum.day 项目
echo    - 点击 "Redeploy" 重新部署
echo.
echo 3. 如果部署成功，访问您的Vercel域名
echo 4. 在Firebase Console中添加Vercel域名到授权列表
echo.
echo 当前项目状态：
git status
echo.
pause
