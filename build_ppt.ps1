$ErrorActionPreference = 'Stop'

function Esc([string]$text) {
    [System.Security.SecurityElement]::Escape($text)
}

$root = Join-Path $PWD 'ppt_build'
if (Test-Path $root) { Remove-Item $root -Recurse -Force }

$dirs = @(
    $root,
    (Join-Path $root '_rels'),
    (Join-Path $root 'docProps'),
    (Join-Path $root 'ppt'),
    (Join-Path $root 'ppt\_rels'),
    (Join-Path $root 'ppt\slides'),
    (Join-Path $root 'ppt\slides\_rels'),
    (Join-Path $root 'ppt\slideLayouts'),
    (Join-Path $root 'ppt\slideLayouts\_rels'),
    (Join-Path $root 'ppt\slideMasters'),
    (Join-Path $root 'ppt\slideMasters\_rels'),
    (Join-Path $root 'ppt\theme')
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Path $_ -Force | Out-Null }

$slides = @(
    @{title='Cuttech 2026 Growth Roadmap'; bullets=@(
        'Integrated view: Lead Generation, Website Revamp, Personas and Partnerships.',
        'Goal: 50-150 qualified leads per month and brand elevation to solutions partner.',
        'Phased 12-month plan with early wins plus automation.'
    )},
    @{title='Executive Overview'; bullets=@(
        'Three phases: Foundation (Months 1-2), Active Lead Generation (3-6), Scale and Automate (7-12).',
        'High-ticket B2B cycle is 3-6 months; trust and proof matter more than ad spend.',
        'Outcome: predictable pipeline via organic, paid, content, social and automation.'
    )},
    @{title='Seven Business Challenges'; bullets=@(
        'Inactive on right platforms; unclear buyer targeting.',
        'Zero visitor analytics or tracking.',
        'Hard to sell high-ticket products without nurturing.',
        'Partner brand names outrank Cuttech in search.',
        'Weak brand identity; seen as distributor not solutions partner.',
        'Content creation is slow; templates missing.',
        'No clear end-to-end marketing strategy or team.'
    )},
    @{title='12-Month Strategic Objectives'; bullets=@(
        'Generate 50-150 qualified B2B leads per month across channels.',
        'Rank top 3 on key industry keywords on Google India.',
        'Reach 2,000+ LinkedIn followers with weekly thought leadership.',
        'Modular content system to build client decks in under 30 minutes.',
        'Website conversion rate target: 2-4% with full analytics.',
        'Build 2,000+ contact database via lead magnets; CPL target under INR 800.'
    )},
    @{title='Phase 1: Foundation (Month 1-2)'; bullets=@(
        'Install GA4 and GTM with form, WhatsApp, call and PDF tracking.',
        'Set up CRM with lead sources, pipelines and quick-response SLAs.',
        'Claim and optimize Google Business Profile and IndiaMart.',
        'Create brand templates and modular content kit for fast proposals.',
        'Launch immediate reputation assets: testimonials request, case study drafts.'
    )},
    @{title='Phase 2: Active Lead Generation (Month 3-6)'; bullets=@(
        'SEO sprints plus weekly LinkedIn posting by leadership.',
        'Publish blog cadence across 8 verticals; run webinars and demo days.',
        'Launch paid search and LinkedIn campaigns with lead magnets and retargeting.',
        'Stand up nurture sequences and lead scoring inside CRM.',
        'Track CPL and lead-to-opportunity ratios monthly.'
    )},
    @{title='Phase 3: Scale and Automate (Month 7-12)'; bullets=@(
        'Marketing automation for handoffs, re-engagement and account-based plays.',
        'Referral program and partner co-marketing with OEMs and resellers.',
        'Case study engine: video plus metric-driven stories each quarter.',
        'Dashboarding for CPL, MQI to SQL conversion, and pipeline velocity.',
        'Goal: steady 50-150 MQLs per month at CPL under INR 800.'
    )},
    @{title='Website Audit: Critical Gaps'; bullets=@(
        'No GA4 or GTM tracking codes installed.',
        '/products page returns 404; navigation dead end.',
        'Homepage is 448 KB with 58 CSS and 46 JS files; slow on mobile.',
        'Missing H1 and XML sitemap; weak on-page SEO.',
        'Zero testimonials or case studies; forms lack compelling offers.',
        'Blog has one post; no lead magnets or gated content.'
    )},
    @{title='Website Roadmap'; bullets=@(
        'Phase 1 (Weeks 1-4): add analytics, fix 404, set H1, sitemap, compress assets.',
        'Phase 2 (Weeks 5-12): high-conversion forms, lead magnets, landing pages, social proof.',
        'Phase 3 (Months 4-6): live chat upgrade, demo booking, exit-intent popups, A/B tests.',
        'Phase 4 (Months 7-12): personalization, dynamic pricing pages, customer portal, automation.',
        'Target conversion: 2-4% of visitors into captured leads.'
    )},
    @{title='Lead Capture Architecture'; bullets=@(
        'GA4 and GTM events flow into CRM with UTM discipline.',
        'Lead scoring by source, page depth, form intent and repeat visits.',
        'Calendar booking plus WhatsApp triggers for high-intent actions.',
        'Retargeting pixels on priority pages; segment audiences by vertical.',
        'Weekly review of form drop-offs and chat transcripts to refine offers.'
    )},
    @{title='Buyer Personas (1)'; bullets=@(
        'Rajesh, Plant Manager: seeks uptime, quality and ROI; wants demos, case studies and ROI calculators.',
        'Priya, Business Owner/MD: wants fast payback and ease of use; trusts peer proof and video testimonials.'
    )},
    @{title='Buyer Personas (2)'; bullets=@(
        'Amit, Procurement Head: optimizes total cost and compliance; needs SLA, certification and pricing comparisons; long RFQ cycles.',
        'Suresh, Technical Engineer: cares about technical depth and integration; consumes tutorials, specs and how-to videos; internal champion.'
    )},
    @{title='Persona-to-Tactic Mapping'; bullets=@(
        'Rajesh: LinkedIn and Google ads to demo pages; ROI tools; on-site demo follow-up.',
        'Priya: referrals, customer visits, testimonial videos and simple pricing clarity.',
        'Amit: RFQ-ready documentation, SLA sheets, reference calls and delivery timelines.',
        'Suresh: YouTube demos, whitepapers, API and integration docs with sandbox access.'
    )},
    @{title='Execution Checklist'; bullets=@(
        'This month: ship GA4+GTM, CRM pipeline, and GBP/IndiaMart updates.',
        'Next 6 weeks: fix website issues and launch three lead magnets with landing pages.',
        'Content: 4 blogs per month across 8 verticals plus one webinar or demo day monthly.',
        'Paid pilots by Month 3 with retargeting audiences; optimize CPL monthly.',
        'Quarterly dashboard review to adjust offers, budget split and nurture flows.'
    )}
)

function New-SlideXml($title, $bullets) {
    $titleEsc = Esc $title
    $bodyParas = $bullets | ForEach-Object {
        $safe = Esc $_
        '<a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US" smtClean="0"/><a:t>' + $safe + '</a:t></a:r></a:p>'
    }

    @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" smtClean="0"/>
              <a:t>$titleEsc</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
$(($bodyParas -join "`n"))
          <a:p>
            <a:pPr lvl="0"/>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>
"@
}

# Slides and slide rels
for ($i = 0; $i -lt $slides.Count; $i++) {
    $num = $i + 1
    $slidePath = Join-Path $root "ppt/slides/slide$num.xml"
    New-SlideXml $slides[$i].title $slides[$i].bullets | Set-Content -LiteralPath $slidePath -Encoding UTF8

    $relPath = Join-Path $root "ppt/slides/_rels/slide$num.xml.rels"
    @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>
"@ | Set-Content -LiteralPath $relPath -Encoding UTF8
}

$slideCount = $slides.Count

# presentation.xml
$sldIdLines = for ($i = 0; $i -lt $slideCount; $i++) {
    $id = 256 + $i
    $rid = "rId{0}" -f ($i + 2)  # rId1 is slideMaster
    '    <p:sldId id="{0}" r:id="{1}"/>' -f $id, $rid
}

@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
$(($sldIdLines -join "`n"))
  </p:sldIdLst>
  <p:slideSize cx="9144000" cy="5143500" type="screen16x9"/>
  <p:notesSize cx="6858000" cy="9144000"/>
  <p:defaultTextStyle/>
</p:presentation>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/presentation.xml') -Encoding UTF8

# presentation rels
$presentationRels = @()
$presentationRels += '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
for ($i = 0; $i -lt $slideCount; $i++) {
    $rid = "rId{0}" -f ($i + 2)
    $presentationRels += ('  <Relationship Id="{0}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{1}.xml"/>' -f $rid, ($i + 1))
}

@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
$(($presentationRels -join "`n"))
</Relationships>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/_rels/presentation.xml.rels') -Encoding UTF8

# slide master
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483648" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle>
      <a:defPPr>
        <a:defRPr sz="4400" b="1" kern="1200"/>
      </a:defPPr>
    </p:titleStyle>
    <p:bodyStyle>
      <a:lvl1pPr marL="0" algn="l" indent="0">
        <a:defRPr sz="2400"/>
      </a:lvl1pPr>
      <a:lvl2pPr marL="457200" indent="0">
        <a:defRPr sz="2200"/>
      </a:lvl2pPr>
      <a:lvl3pPr marL="914400" indent="0">
        <a:defRPr sz="2000"/>
      </a:lvl3pPr>
    </p:bodyStyle>
    <p:otherStyle>
      <a:defPPr/>
    </p:otherStyle>
  </p:txStyles>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:hdrFooter/>
  <p:notesStyle>
    <a:lvl1pPr marL="0" indent="0">
      <a:defRPr sz="1800"/>
    </a:lvl1pPr>
  </p:notesStyle>
</p:sldMaster>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/slideMasters/slideMaster1.xml') -Encoding UTF8

@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/slideMasters/_rels/slideMaster1.xml.rels') -Encoding UTF8

# slide layout
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="title" preserve="1">
  <p:cSld name="Title and Content">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p/>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p/>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/slideLayouts/slideLayout1.xml') -Encoding UTF8

@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/slideLayouts/_rels/slideLayout1.xml.rels') -Encoding UTF8

# theme1.xml (default office theme)
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="44546A"/></a:dk2>
      <a:lt2><a:srgbClr val="E7E6E6"/></a:lt2>
      <a:accent1><a:srgbClr val="4472C4"/></a:accent1>
      <a:accent2><a:srgbClr val="ED7D31"/></a:accent2>
      <a:accent3><a:srgbClr val="A5A5A5"/></a:accent3>
      <a:accent4><a:srgbClr val="FFC000"/></a:accent4>
      <a:accent5><a:srgbClr val="5B9BD5"/></a:accent5>
      <a:accent6><a:srgbClr val="70AD47"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
      <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont>
        <a:latin typeface="Calibri Light" panose="020F0302020204030204"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Calibri" panose="020F0502020204030204"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>
            <a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="1"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="350000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="130000"/></a:schemeClr></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="94000"/><a:satMod val="135000"/><a:shade val="94000"/><a:lumMod val="105000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="0"/>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>
"@ | Set-Content -LiteralPath (Join-Path $root 'ppt/theme/theme1.xml') -Encoding UTF8

# [Content_Types].xml
$ctOverrides = @(
    '  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
    '  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
    '  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
    '  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
    '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
)
for ($i = 0; $i -lt $slideCount; $i++) {
    $ctOverrides += ('  <Override PartName="/ppt/slides/slide{0}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' -f ($i + 1))
}

@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
$(($ctOverrides -join "`n"))
</Types>
"@ | Set-Content -LiteralPath (Join-Path $root '[Content_Types].xml') -Encoding UTF8

# root relationships
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@ | Set-Content -LiteralPath (Join-Path $root '_rels/.rels') -Encoding UTF8

# docProps/core.xml
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Cuttech Growth Roadmap 2026</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-04-05T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-04-05T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"@ | Set-Content -LiteralPath (Join-Path $root 'docProps/core.xml') -Encoding UTF8

# docProps/app.xml
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office PowerPoint</Application>
  <PresentationFormat>Widescreen</PresentationFormat>
  <Slides>$slideCount</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
"@ | Set-Content -LiteralPath (Join-Path $root 'docProps/app.xml') -Encoding UTF8

# zip to pptx
$zipPath = Join-Path $PWD 'Cuttech_Growth_Roadmap_2026.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $root '*') -DestinationPath $zipPath -Force

$dest = Join-Path $PWD 'Cuttech_Growth_Roadmap_2026.pptx'
if (Test-Path $dest) { Remove-Item $dest -Force }
Rename-Item -Path $zipPath -NewName (Split-Path $dest -Leaf)
Write-Host "Done: $dest"
