const fs = require('fs');
const path = '/Users/phantom/Documents/Kerja/Mindful Living/admin-mindful-living/src/components/dashboard/pages/ChapterManagementPage.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Section Content Preview</span>
                      <div style={{ padding: '16px', background: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {chapterForm.editorBlocks && chapterForm.editorBlocks.map((block, idx) => {
                          if (block.type === 'text') {
                            return (
                              <div 
                                key={block.id}
                                style={{ fontSize: '14px', color: '#4A5568', lineHeight: '1.6' }}
                                dangerouslySetInnerHTML={{ __html: block.content || "-" }}
                              />
                            );
                          }
                          return (
                            <div key={block.id} style={{ padding: '12px', background: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {block.type === 'image' && block.url ? (
                                <img src={block.url} alt={block.title || 'Preview'} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                              ) : (
                                <div style={{ width: '60px', height: '60px', background: '#EDF2F7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0' }}>
                                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect></svg>
                                </div>
                              )}
                              <div>
                                <strong style={{ display: 'block', fontSize: '14px', color: '#2D3748' }}>{block.title || \`Media Block \${idx}\`}</strong>
                                <span style={{ fontSize: '12px', color: '#718096', textTransform: 'capitalize' }}>{block.type} Block {block.isRequired ? '(Required)' : ''}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>`;

const newCode = `                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Section Content</span>
                      <div style={{ padding: '16px', background: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {chapterForm.editorBlocks && chapterForm.editorBlocks.filter(b => b.type === 'text').map((block) => (
                          <div 
                            key={block.id}
                            style={{ fontSize: '14px', color: '#4A5568', lineHeight: '1.6' }}
                            dangerouslySetInnerHTML={{ __html: block.content || "-" }}
                          />
                        ))}
                      </div>
                    </div>

                    {chapterForm.editorBlocks && chapterForm.editorBlocks.filter(b => b.type !== 'text').length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px', fontWeight: '600' }}>Attached Media ({chapterForm.editorBlocks.filter(b => b.type !== 'text').length})</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {chapterForm.editorBlocks.filter(b => b.type !== 'text').map((block, idx) => (
                            <div key={block.id} style={{ padding: '12px', background: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {block.type === 'image' && block.url ? (
                                <img src={block.url} alt={block.title || 'Preview'} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                              ) : (
                                <div style={{ width: '60px', height: '60px', background: '#EDF2F7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0' }}>
                                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect></svg>
                                </div>
                              )}
                              <div>
                                <strong style={{ display: 'block', fontSize: '14px', color: '#2D3748' }}>{block.title || \`Media Block \${idx + 1}\`}</strong>
                                <span style={{ fontSize: '12px', color: '#718096', textTransform: 'capitalize' }}>{block.type} Block {block.isRequired ? '(Required)' : ''}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find old code block.");
}
