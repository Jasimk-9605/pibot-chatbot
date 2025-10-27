const fs = require('fs');
const path = require('path');

const loadConfig = () => {
  try {
    // Load company data
    const companyDataPath = path.join(__dirname, 'companyData.json');
    const companyData = JSON.parse(fs.readFileSync(companyDataPath, 'utf8'));

    // Load and compile system prompt template
    const promptTemplatePath = path.join(__dirname, 'systemPromptTemplate.txt');
    let systemPrompt = fs.readFileSync(promptTemplatePath, 'utf8');

    // Replace placeholders in the prompt template
    systemPrompt = systemPrompt
      .replace(/{{name}}/g, companyData.name)
      .replace(/{{location}}/g, companyData.location)
      .replace(/{{physicalAddress}}/g, companyData.physicalAddress)
      .replace(
        /{{services}}/g,
        [
          '→ <span class="service-item">Sales Outsourcing</span>',
          '→ <span class="service-toggle" onclick="toggleSubServices()">Business Consulting →</span>',
          '<div id="subServices" style="display:none; margin-left: 1rem;">',
          '   - Market Positioning & Branding',
          '   - Sales Training Strategies',
          '   - Operations Training & Strategies',
          '   - Financial Consulting',
          '   - Hiring & Retention',
          '   - Risk Management',
          '   - Asset Management',
          '   - IT Services',
          '</div>'
        ].join('\n')
      )
      .replace(
        /{{team}}/g,
        companyData.team
          .map(member => `${member.name} (${member.role}) - ${member.background}`)
          .join('\n')
      );

    return {
      companyData,
      systemPrompt
    };
  } catch (error) {
    console.error('Error loading configuration:', error);
    process.exit(1);
  }
};

module.exports = loadConfig;