
const SEED_H25 = [{"name":"Aaron Judge","team":"NYY","age":33,"pos":"RF","ab":522,"pa":642,"avg":0.322,"obp":0.458,"slg":0.701,"ops":1.159,"hr":58,"rbi":144,"sb":10,"wrc_plus":210,"xwoba":0.441,"woba":0.452,"brl_pct":23.8,"ev":97.4,"k_pct":19.9,"bb_pct":19.8,"war":10.4,"xba":0.308,"xslg":0.659,"hard_hit":54.3,"sprint_spd":27.2,"iso":0.379,"babip":0.308,"swstr":12.4,"mlbam_id":592450},{"name":"Shohei Ohtani","team":"LAD","age":31,"pos":"DH","ab":508,"pa":622,"avg":0.31,"obp":0.396,"slg":0.646,"ops":1.042,"hr":48,"rbi":130,"sb":40,"wrc_plus":183,"xwoba":0.418,"woba":0.421,"brl_pct":19.2,"ev":95.1,"k_pct":22.0,"bb_pct":13.2,"war":9.1,"xba":0.291,"xslg":0.604,"hard_hit":51.8,"sprint_spd":30.2,"iso":0.336,"babip":0.316,"swstr":12.8,"mlbam_id":660271},{"name":"Yordan Alvarez","team":"HOU","age":28,"pos":"DH","ab":485,"pa":589,"avg":0.302,"obp":0.393,"slg":0.621,"ops":1.014,"hr":45,"rbi":128,"sb":3,"wrc_plus":172,"xwoba":0.413,"woba":0.418,"brl_pct":21.4,"ev":96.1,"k_pct":21.3,"bb_pct":13.3,"war":7.8,"xba":0.288,"xslg":0.592,"hard_hit":52.9,"sprint_spd":26.1,"iso":0.319,"babip":0.302,"swstr":13.1,"mlbam_id":670541},{"name":"Ronald Acuna Jr.","team":"ATL","age":27,"pos":"RF","ab":472,"pa":572,"avg":0.294,"obp":0.381,"slg":0.558,"ops":0.939,"hr":35,"rbi":98,"sb":49,"wrc_plus":158,"xwoba":0.398,"woba":0.403,"brl_pct":17.8,"ev":93.4,"k_pct":20.4,"bb_pct":12.5,"war":8.2,"xba":0.277,"xslg":0.526,"hard_hit":47.8,"sprint_spd":29.8,"iso":0.264,"babip":0.298,"swstr":11.6,"mlbam_id":660670},{"name":"Bobby Witt Jr.","team":"KC","age":25,"pos":"SS","ab":584,"pa":648,"avg":0.302,"obp":0.358,"slg":0.531,"ops":0.889,"hr":33,"rbi":104,"sb":44,"wrc_plus":144,"xwoba":0.369,"woba":0.372,"brl_pct":11.4,"ev":91.4,"k_pct":21.8,"bb_pct":8.2,"war":7.6,"xba":0.283,"xslg":0.501,"hard_hit":44.8,"sprint_spd":30.6,"iso":0.229,"babip":0.326,"swstr":10.8,"mlbam_id":677951},{"name":"Jose Ramirez","team":"CLE","age":32,"pos":"3B","ab":538,"pa":614,"avg":0.284,"obp":0.365,"slg":0.521,"ops":0.886,"hr":36,"rbi":119,"sb":24,"wrc_plus":148,"xwoba":0.381,"woba":0.383,"brl_pct":13.8,"ev":91.6,"k_pct":14.1,"bb_pct":11.8,"war":7.5,"xba":0.271,"xslg":0.494,"hard_hit":46.2,"sprint_spd":27.8,"iso":0.237,"babip":0.286,"swstr":9.4,"mlbam_id":608070},{"name":"Freddie Freeman","team":"LAD","age":35,"pos":"1B","ab":528,"pa":620,"avg":0.295,"obp":0.378,"slg":0.529,"ops":0.907,"hr":32,"rbi":109,"sb":5,"wrc_plus":153,"xwoba":0.386,"woba":0.4,"brl_pct":14.6,"ev":92.4,"k_pct":15.2,"bb_pct":11.2,"war":6.1,"xba":0.279,"xslg":0.501,"hard_hit":45.6,"sprint_spd":24.8,"iso":0.234,"babip":0.298,"swstr":10.2,"mlbam_id":518692},{"name":"Gunnar Henderson","team":"BAL","age":24,"pos":"SS","ab":514,"pa":605,"avg":0.281,"obp":0.368,"slg":0.534,"ops":0.902,"hr":38,"rbi":104,"sb":28,"wrc_plus":152,"xwoba":0.392,"woba":0.387,"brl_pct":16.4,"ev":93.1,"k_pct":26.0,"bb_pct":12.3,"war":7.4,"xba":0.268,"xslg":0.503,"hard_hit":48.2,"sprint_spd":28.9,"iso":0.253,"babip":0.282,"swstr":13.1,"mlbam_id":683002},{"name":"Corey Seager","team":"TEX","age":31,"pos":"SS","ab":434,"pa":502,"avg":0.291,"obp":0.371,"slg":0.558,"ops":0.929,"hr":34,"rbi":100,"sb":4,"wrc_plus":155,"xwoba":0.388,"woba":0.384,"brl_pct":16.1,"ev":92.2,"k_pct":21.1,"bb_pct":12.1,"war":5.6,"xba":0.276,"xslg":0.524,"hard_hit":46.8,"sprint_spd":26.4,"iso":0.267,"babip":0.29,"swstr":11.4,"mlbam_id":608369},{"name":"Mookie Betts","team":"LAD","age":32,"pos":"RF","ab":452,"pa":543,"avg":0.283,"obp":0.374,"slg":0.508,"ops":0.882,"hr":26,"rbi":84,"sb":18,"wrc_plus":147,"xwoba":0.378,"woba":0.381,"brl_pct":13.6,"ev":91.2,"k_pct":16.7,"bb_pct":13.5,"war":6.4,"xba":0.27,"xslg":0.48,"hard_hit":44.8,"sprint_spd":27.8,"iso":0.225,"babip":0.286,"swstr":10.1,"mlbam_id":605141},{"name":"Bryce Harper","team":"PHI","age":32,"pos":"1B","ab":456,"pa":556,"avg":0.278,"obp":0.374,"slg":0.521,"ops":0.895,"hr":30,"rbi":94,"sb":8,"wrc_plus":148,"xwoba":0.382,"woba":0.387,"brl_pct":14.8,"ev":91.8,"k_pct":20.8,"bb_pct":14.1,"war":5.2,"xba":0.262,"xslg":0.49,"hard_hit":44.1,"sprint_spd":26.8,"iso":0.243,"babip":0.288,"swstr":10.8,"mlbam_id":547180},{"name":"Kyle Tucker","team":"CHC","age":28,"pos":"RF","ab":474,"pa":558,"avg":0.27,"obp":0.356,"slg":0.498,"ops":0.854,"hr":28,"rbi":91,"sb":26,"wrc_plus":138,"xwoba":0.368,"woba":0.372,"brl_pct":14.1,"ev":92.0,"k_pct":18.7,"bb_pct":12.8,"war":4.8,"xba":0.256,"xslg":0.468,"hard_hit":43.4,"sprint_spd":28.2,"iso":0.228,"babip":0.274,"swstr":10.4,"mlbam_id":663656},{"name":"Adley Rutschman","team":"BAL","age":27,"pos":"C","ab":477,"pa":568,"avg":0.268,"obp":0.364,"slg":0.454,"ops":0.818,"hr":22,"rbi":84,"sb":5,"wrc_plus":133,"xwoba":0.36,"woba":0.358,"brl_pct":10.2,"ev":90.6,"k_pct":16.3,"bb_pct":13.9,"war":5.4,"xba":0.256,"xslg":0.432,"hard_hit":42.8,"sprint_spd":26.6,"iso":0.186,"babip":0.278,"swstr":9.2,"mlbam_id":668939},{"name":"Matt Olson","team":"ATL","age":31,"pos":"1B","ab":499,"pa":601,"avg":0.26,"obp":0.354,"slg":0.522,"ops":0.876,"hr":38,"rbi":112,"sb":2,"wrc_plus":142,"xwoba":0.378,"woba":0.371,"brl_pct":19.2,"ev":92.8,"k_pct":26.4,"bb_pct":13.3,"war":5.4,"xba":0.248,"xslg":0.494,"hard_hit":47.1,"sprint_spd":24.2,"iso":0.262,"babip":0.262,"swstr":12.8,"mlbam_id":621566},{"name":"Fernando Tatis Jr.","team":"SD","age":26,"pos":"RF","ab":468,"pa":542,"avg":0.278,"obp":0.356,"slg":0.534,"ops":0.89,"hr":35,"rbi":96,"sb":29,"wrc_plus":145,"xwoba":0.376,"woba":0.379,"brl_pct":16.8,"ev":92.9,"k_pct":24.3,"bb_pct":11.1,"war":5.9,"xba":0.264,"xslg":0.502,"hard_hit":46.4,"sprint_spd":29.4,"iso":0.256,"babip":0.281,"swstr":12.2,"mlbam_id":665487},{"name":"Francisco Lindor","team":"NYM","age":31,"pos":"SS","ab":548,"pa":622,"avg":0.275,"obp":0.348,"slg":0.484,"ops":0.832,"hr":31,"rbi":96,"sb":21,"wrc_plus":128,"xwoba":0.349,"woba":0.347,"brl_pct":11.2,"ev":90.6,"k_pct":19.5,"bb_pct":10.9,"war":6.1,"xba":0.262,"xslg":0.454,"hard_hit":42.1,"sprint_spd":27.6,"iso":0.209,"babip":0.278,"swstr":10.6,"mlbam_id":596019},{"name":"Pete Alonso","team":"NYM","age":30,"pos":"1B","ab":492,"pa":576,"avg":0.258,"obp":0.346,"slg":0.514,"ops":0.86,"hr":38,"rbi":106,"sb":1,"wrc_plus":135,"xwoba":0.354,"woba":0.348,"brl_pct":17.2,"ev":92.4,"k_pct":27.0,"bb_pct":12.3,"war":3.4,"xba":0.244,"xslg":0.484,"hard_hit":46.2,"sprint_spd":24.1,"iso":0.256,"babip":0.258,"swstr":12.9,"mlbam_id":624413},{"name":"Trea Turner","team":"PHI","age":32,"pos":"SS","ab":530,"pa":590,"avg":0.287,"obp":0.348,"slg":0.472,"ops":0.82,"hr":24,"rbi":90,"sb":30,"wrc_plus":124,"xwoba":0.345,"woba":0.341,"brl_pct":10.4,"ev":90.8,"k_pct":18.2,"bb_pct":8.5,"war":4.6,"xba":0.271,"xslg":0.441,"hard_hit":41.6,"sprint_spd":30.1,"iso":0.185,"babip":0.304,"swstr":9.8,"mlbam_id":607208},{"name":"Luis Arraez","team":"SD","age":28,"pos":"2B","ab":512,"pa":578,"avg":0.322,"obp":0.381,"slg":0.418,"ops":0.799,"hr":8,"rbi":58,"sb":4,"wrc_plus":127,"xwoba":0.36,"woba":0.362,"brl_pct":3.4,"ev":86.4,"k_pct":5.4,"bb_pct":8.8,"war":4.2,"xba":0.308,"xslg":0.396,"hard_hit":32.1,"sprint_spd":26.4,"iso":0.096,"babip":0.334,"swstr":3.8,"mlbam_id":650333},{"name":"Rafael Devers","team":"BOS","age":28,"pos":"3B","ab":504,"pa":582,"avg":0.274,"obp":0.344,"slg":0.498,"ops":0.842,"hr":30,"rbi":102,"sb":4,"wrc_plus":130,"xwoba":0.352,"woba":0.349,"brl_pct":14.2,"ev":91.6,"k_pct":24.4,"bb_pct":11.2,"war":3.8,"xba":0.261,"xslg":0.47,"hard_hit":44.1,"sprint_spd":25.8,"iso":0.224,"babip":0.278,"swstr":11.6,"mlbam_id":646240},{"name":"Austin Riley","team":"ATL","age":28,"pos":"3B","ab":490,"pa":566,"avg":0.254,"obp":0.326,"slg":0.484,"ops":0.81,"hr":30,"rbi":96,"sb":6,"wrc_plus":124,"xwoba":0.346,"woba":0.342,"brl_pct":14.8,"ev":92.2,"k_pct":25.2,"bb_pct":10.5,"war":3.4,"xba":0.241,"xslg":0.456,"hard_hit":44.8,"sprint_spd":26.6,"iso":0.23,"babip":0.254,"swstr":12.2,"mlbam_id":663586},{"name":"Kyle Schwarber","team":"PHI","age":32,"pos":"LF","ab":470,"pa":574,"avg":0.218,"obp":0.344,"slg":0.468,"ops":0.812,"hr":38,"rbi":94,"sb":5,"wrc_plus":128,"xwoba":0.352,"woba":0.348,"brl_pct":18.4,"ev":91.6,"k_pct":30.6,"bb_pct":16.0,"war":3.2,"xba":0.206,"xslg":0.438,"hard_hit":44.1,"sprint_spd":25.8,"iso":0.25,"babip":0.204,"swstr":14.2,"mlbam_id":656941},{"name":"Steven Kwan","team":"CLE","age":27,"pos":"LF","ab":520,"pa":595,"avg":0.306,"obp":0.374,"slg":0.432,"ops":0.806,"hr":11,"rbi":68,"sb":28,"wrc_plus":128,"xwoba":0.348,"woba":0.352,"brl_pct":4.2,"ev":85.9,"k_pct":9.4,"bb_pct":11.0,"war":4.8,"xba":0.295,"xslg":0.41,"hard_hit":30.8,"sprint_spd":28.6,"iso":0.126,"babip":0.328,"swstr":5.4,"mlbam_id":680757},{"name":"Jazz Chisholm Jr.","team":"NYY","age":27,"pos":"2B","ab":454,"pa":524,"avg":0.264,"obp":0.342,"slg":0.484,"ops":0.826,"hr":28,"rbi":82,"sb":24,"wrc_plus":129,"xwoba":0.344,"woba":0.34,"brl_pct":12.1,"ev":91.4,"k_pct":27.0,"bb_pct":11.0,"war":4.1,"xba":0.25,"xslg":0.454,"hard_hit":44.1,"sprint_spd":29.8,"iso":0.22,"babip":0.264,"swstr":13.2,"mlbam_id":665862},{"name":"Julio Rodriguez","team":"SEA","age":24,"pos":"CF","ab":500,"pa":575,"avg":0.274,"obp":0.345,"slg":0.481,"ops":0.826,"hr":28,"rbi":86,"sb":36,"wrc_plus":128,"xwoba":0.351,"woba":0.348,"brl_pct":11.6,"ev":92.1,"k_pct":25.4,"bb_pct":10.4,"war":4.4,"xba":0.258,"xslg":0.452,"hard_hit":42.8,"sprint_spd":30.4,"iso":0.207,"babip":0.278,"swstr":12.6,"mlbam_id":677594},{"name":"Elly De La Cruz","team":"CIN","age":23,"pos":"SS","ab":468,"pa":548,"avg":0.261,"obp":0.338,"slg":0.478,"ops":0.816,"hr":28,"rbi":84,"sb":48,"wrc_plus":124,"xwoba":0.341,"woba":0.336,"brl_pct":9.2,"ev":92.6,"k_pct":30.5,"bb_pct":11.3,"war":4.6,"xba":0.248,"xslg":0.448,"hard_hit":44.8,"sprint_spd":31.8,"iso":0.217,"babip":0.268,"swstr":14.6,"mlbam_id":682829},{"name":"Willy Adames","team":"SFG","age":30,"pos":"SS","ab":478,"pa":552,"avg":0.254,"obp":0.34,"slg":0.462,"ops":0.802,"hr":28,"rbi":86,"sb":10,"wrc_plus":122,"xwoba":0.344,"woba":0.34,"brl_pct":12.4,"ev":90.1,"k_pct":25.6,"bb_pct":11.8,"war":4.0,"xba":0.242,"xslg":0.434,"hard_hit":42.1,"sprint_spd":27.8,"iso":0.208,"babip":0.254,"swstr":12.1,"mlbam_id":642715},{"name":"Marcell Ozuna","team":"ATL","age":34,"pos":"DH","ab":437,"pa":510,"avg":0.257,"obp":0.33,"slg":0.484,"ops":0.814,"hr":30,"rbi":94,"sb":2,"wrc_plus":124,"xwoba":0.346,"woba":0.342,"brl_pct":15.6,"ev":91.9,"k_pct":25.8,"bb_pct":11.0,"war":2.4,"xba":0.244,"xslg":0.456,"hard_hit":44.2,"sprint_spd":24.8,"iso":0.227,"babip":0.254,"swstr":12.4,"mlbam_id":542303},{"name":"Anthony Santander","team":"TOR","age":30,"pos":"RF","ab":479,"pa":548,"avg":0.257,"obp":0.33,"slg":0.494,"ops":0.824,"hr":32,"rbi":96,"sb":4,"wrc_plus":128,"xwoba":0.361,"woba":0.364,"brl_pct":15.2,"ev":91.8,"k_pct":24.6,"bb_pct":10.7,"war":3.8,"xba":0.244,"xslg":0.464,"hard_hit":44.6,"sprint_spd":26.4,"iso":0.237,"babip":0.254,"swstr":12.2,"mlbam_id":623993},{"name":"Teoscar Hernandez","team":"LAD","age":32,"pos":"RF","ab":473,"pa":528,"avg":0.262,"obp":0.318,"slg":0.488,"ops":0.806,"hr":30,"rbi":96,"sb":8,"wrc_plus":122,"xwoba":0.344,"woba":0.341,"brl_pct":14.6,"ev":91.8,"k_pct":26.5,"bb_pct":9.0,"war":2.8,"xba":0.249,"xslg":0.458,"hard_hit":44.1,"sprint_spd":27.8,"iso":0.226,"babip":0.261,"swstr":13.1,"mlbam_id":606192},{"name":"Isaac Paredes","team":"TB","age":26,"pos":"3B","ab":463,"pa":545,"avg":0.254,"obp":0.356,"slg":0.468,"ops":0.824,"hr":28,"rbi":84,"sb":2,"wrc_plus":132,"xwoba":0.358,"woba":0.354,"brl_pct":13.6,"ev":90.2,"k_pct":19.8,"bb_pct":12.1,"war":3.4,"xba":0.242,"xslg":0.44,"hard_hit":42.8,"sprint_spd":25.6,"iso":0.214,"babip":0.256,"swstr":10.8,"mlbam_id":670623},{"name":"Jarren Duran","team":"BOS","age":28,"pos":"CF","ab":490,"pa":548,"avg":0.28,"obp":0.346,"slg":0.476,"ops":0.822,"hr":21,"rbi":78,"sb":38,"wrc_plus":128,"xwoba":0.346,"woba":0.343,"brl_pct":10.8,"ev":90.4,"k_pct":21.7,"bb_pct":9.6,"war":4.1,"xba":0.265,"xslg":0.448,"hard_hit":41.2,"sprint_spd":30.8,"iso":0.196,"babip":0.296,"swstr":10.8,"mlbam_id":680776},{"name":"Jackson Chourio","team":"MIL","age":21,"pos":"LF","ab":468,"pa":528,"avg":0.272,"obp":0.33,"slg":0.468,"ops":0.798,"hr":24,"rbi":82,"sb":26,"wrc_plus":118,"xwoba":0.34,"woba":0.336,"brl_pct":11.4,"ev":91.6,"k_pct":24.7,"bb_pct":9.7,"war":3.4,"xba":0.258,"xslg":0.44,"hard_hit":42.8,"sprint_spd":29.4,"iso":0.196,"babip":0.278,"swstr":12.4,"mlbam_id":694192},{"name":"Riley Greene","team":"DET","age":24,"pos":"LF","ab":471,"pa":545,"avg":0.271,"obp":0.35,"slg":0.478,"ops":0.828,"hr":26,"rbi":82,"sb":12,"wrc_plus":130,"xwoba":0.351,"woba":0.348,"brl_pct":10.8,"ev":91.2,"k_pct":22.9,"bb_pct":11.3,"war":3.8,"xba":0.257,"xslg":0.448,"hard_hit":42.4,"sprint_spd":28.1,"iso":0.207,"babip":0.276,"swstr":11.2,"mlbam_id":682985},{"name":"Josh Naylor","team":"CLE","age":28,"pos":"1B","ab":460,"pa":524,"avg":0.274,"obp":0.348,"slg":0.48,"ops":0.828,"hr":26,"rbi":94,"sb":4,"wrc_plus":130,"xwoba":0.352,"woba":0.348,"brl_pct":13.9,"ev":91.6,"k_pct":19.1,"bb_pct":10.8,"war":3.2,"xba":0.261,"xslg":0.452,"hard_hit":43.8,"sprint_spd":25.1,"iso":0.206,"babip":0.276,"swstr":11.4,"mlbam_id":647304},{"name":"Mark Vientos","team":"NYM","age":24,"pos":"3B","ab":320,"pa":382,"avg":0.258,"obp":0.328,"slg":0.488,"ops":0.816,"hr":26,"rbi":72,"sb":2,"wrc_plus":126,"xwoba":0.35,"woba":0.346,"brl_pct":15.4,"ev":92.0,"k_pct":25.8,"bb_pct":11.9,"war":2.2,"xba":0.246,"xslg":0.46,"hard_hit":44.8,"sprint_spd":26.4,"iso":0.23,"babip":0.256,"swstr":12.8,"mlbam_id":678976},{"name":"Giancarlo Stanton","team":"NYY","age":35,"pos":"DH","ab":336,"pa":401,"avg":0.232,"obp":0.308,"slg":0.494,"ops":0.802,"hr":26,"rbi":78,"sb":1,"wrc_plus":122,"xwoba":0.344,"woba":0.341,"brl_pct":18.2,"ev":95.2,"k_pct":30.7,"bb_pct":12.4,"war":2.1,"xba":0.219,"xslg":0.466,"hard_hit":51.4,"sprint_spd":24.4,"iso":0.262,"babip":0.222,"swstr":14.8,"mlbam_id":519317},{"name":"Ozzie Albies","team":"ATL","age":28,"pos":"2B","ab":430,"pa":490,"avg":0.26,"obp":0.316,"slg":0.446,"ops":0.762,"hr":22,"rbi":76,"sb":16,"wrc_plus":112,"xwoba":0.334,"woba":0.33,"brl_pct":11.8,"ev":90.6,"k_pct":20.2,"bb_pct":9.7,"war":3.2,"xba":0.248,"xslg":0.42,"hard_hit":42.1,"sprint_spd":28.6,"iso":0.186,"babip":0.264,"swstr":10.6,"mlbam_id":645277},{"name":"Wyatt Langford","team":"TEX","age":23,"pos":"LF","ab":432,"pa":496,"avg":0.258,"obp":0.332,"slg":0.446,"ops":0.778,"hr":22,"rbi":74,"sb":14,"wrc_plus":116,"xwoba":0.336,"woba":0.332,"brl_pct":11.8,"ev":91.0,"k_pct":24.9,"bb_pct":11.1,"war":2.8,"xba":0.245,"xslg":0.42,"hard_hit":41.8,"sprint_spd":28.6,"iso":0.188,"babip":0.262,"swstr":12.2,"mlbam_id":700363},{"name":"Bryan Reynolds","team":"PIT","age":30,"pos":"CF","ab":476,"pa":548,"avg":0.262,"obp":0.341,"slg":0.454,"ops":0.795,"hr":22,"rbi":78,"sb":10,"wrc_plus":122,"xwoba":0.345,"woba":0.341,"brl_pct":11.4,"ev":90.6,"k_pct":21.8,"bb_pct":11.4,"war":3.4,"xba":0.249,"xslg":0.428,"hard_hit":41.8,"sprint_spd":27.1,"iso":0.192,"babip":0.268,"swstr":11.2,"mlbam_id":668804},{"name":"Manny Machado","team":"SD","age":33,"pos":"3B","ab":402,"pa":456,"avg":0.258,"obp":0.328,"slg":0.432,"ops":0.76,"hr":18,"rbi":72,"sb":6,"wrc_plus":108,"xwoba":0.322,"woba":0.318,"brl_pct":11.4,"ev":90.8,"k_pct":20.6,"bb_pct":9.4,"war":2.4,"xba":0.246,"xslg":0.408,"hard_hit":41.0,"sprint_spd":25.6,"iso":0.174,"babip":0.264,"swstr":10.2,"mlbam_id":592518},{"name":"Cal Raleigh","team":"SEA","age":28,"pos":"C","ab":415,"pa":498,"avg":0.228,"obp":0.316,"slg":0.458,"ops":0.774,"hr":28,"rbi":84,"sb":2,"wrc_plus":116,"xwoba":0.336,"woba":0.332,"brl_pct":16.4,"ev":91.8,"k_pct":28.9,"bb_pct":13.3,"war":3.2,"xba":0.216,"xslg":0.43,"hard_hit":44.2,"sprint_spd":24.8,"iso":0.23,"babip":0.218,"swstr":14.4,"mlbam_id":663728},{"name":"Cody Bellinger","team":"CHC","age":29,"pos":"CF","ab":453,"pa":523,"avg":0.262,"obp":0.338,"slg":0.454,"ops":0.792,"hr":24,"rbi":78,"sb":14,"wrc_plus":120,"xwoba":0.344,"woba":0.34,"brl_pct":11.8,"ev":90.4,"k_pct":22.6,"bb_pct":11.0,"war":3.6,"xba":0.249,"xslg":0.428,"hard_hit":41.6,"sprint_spd":28.4,"iso":0.192,"babip":0.266,"swstr":11.4,"mlbam_id":641355},{"name":"Marcus Semien","team":"TEX","age":34,"pos":"2B","ab":552,"pa":614,"avg":0.259,"obp":0.33,"slg":0.442,"ops":0.772,"hr":24,"rbi":84,"sb":18,"wrc_plus":112,"xwoba":0.334,"woba":0.329,"brl_pct":9.4,"ev":89.4,"k_pct":19.7,"bb_pct":9.2,"war":5.1,"xba":0.247,"xslg":0.418,"hard_hit":40.2,"sprint_spd":27.4,"iso":0.183,"babip":0.264,"swstr":10.1,"mlbam_id":543760},{"name":"Christian Yelich","team":"MIL","age":33,"pos":"LF","ab":441,"pa":514,"avg":0.254,"obp":0.348,"slg":0.432,"ops":0.78,"hr":18,"rbi":68,"sb":12,"wrc_plus":120,"xwoba":0.342,"woba":0.338,"brl_pct":10.4,"ev":90.2,"k_pct":21.4,"bb_pct":12.8,"war":3.1,"xba":0.241,"xslg":0.408,"hard_hit":40.4,"sprint_spd":27.6,"iso":0.178,"babip":0.266,"swstr":10.8,"mlbam_id":592885},{"name":"Nathaniel Lowe","team":"TEX","age":29,"pos":"1B","ab":522,"pa":596,"avg":0.268,"obp":0.344,"slg":0.418,"ops":0.762,"hr":16,"rbi":74,"sb":8,"wrc_plus":112,"xwoba":0.332,"woba":0.329,"brl_pct":8.0,"ev":89.6,"k_pct":17.1,"bb_pct":10.5,"war":2.9,"xba":0.256,"xslg":0.396,"hard_hit":39.8,"sprint_spd":25.9,"iso":0.15,"babip":0.286,"swstr":9.4,"mlbam_id":663993},{"name":"Corbin Carroll","team":"ARI","age":24,"pos":"CF","ab":442,"pa":508,"avg":0.244,"obp":0.316,"slg":0.394,"ops":0.71,"hr":14,"rbi":54,"sb":28,"wrc_plus":96,"xwoba":0.306,"woba":0.302,"brl_pct":7.4,"ev":88.8,"k_pct":24.4,"bb_pct":9.8,"war":2.4,"xba":0.232,"xslg":0.374,"hard_hit":38.2,"sprint_spd":30.8,"iso":0.15,"babip":0.256,"swstr":12.2,"mlbam_id":682097},{"name":"William Contreras","team":"MIL","age":27,"pos":"C","ab":408,"pa":474,"avg":0.258,"obp":0.338,"slg":0.448,"ops":0.786,"hr":22,"rbi":76,"sb":4,"wrc_plus":120,"xwoba":0.34,"woba":0.336,"brl_pct":12.1,"ev":91.0,"k_pct":21.3,"bb_pct":12.2,"war":3.0,"xba":0.245,"xslg":0.422,"hard_hit":41.8,"sprint_spd":25.4,"iso":0.19,"babip":0.262,"swstr":10.8,"mlbam_id":661388},{"name":"Salvador Perez","team":"KC","age":35,"pos":"C","ab":413,"pa":448,"avg":0.24,"obp":0.287,"slg":0.426,"ops":0.713,"hr":22,"rbi":80,"sb":2,"wrc_plus":98,"xwoba":0.306,"woba":0.303,"brl_pct":12.8,"ev":91.0,"k_pct":25.7,"bb_pct":6.3,"war":1.2,"xba":0.228,"xslg":0.402,"hard_hit":42.6,"sprint_spd":24.1,"iso":0.186,"babip":0.24,"swstr":12.8,"mlbam_id":521692},{"name":"Ha-Seong Kim","team":"SD","age":29,"pos":"2B","ab":344,"pa":400,"avg":0.234,"obp":0.306,"slg":0.368,"ops":0.674,"hr":10,"rbi":44,"sb":22,"wrc_plus":88,"xwoba":0.292,"woba":0.288,"brl_pct":5.8,"ev":87.8,"k_pct":22.4,"bb_pct":9.6,"war":2.2,"xba":0.222,"xslg":0.348,"hard_hit":35.4,"sprint_spd":28.8,"iso":0.134,"babip":0.252,"swstr":11.8,"mlbam_id":677278},{"name":"CJ Abrams","team":"WSH","age":25,"pos":"SS","ab":468,"pa":534,"avg":0.262,"obp":0.33,"slg":0.424,"ops":0.754,"hr":18,"rbi":68,"sb":34,"wrc_plus":108,"xwoba":0.318,"woba":0.315,"brl_pct":6.4,"ev":88.4,"k_pct":23.1,"bb_pct":9.7,"war":2.4,"xba":0.248,"xslg":0.398,"hard_hit":38.4,"sprint_spd":31.2,"iso":0.162,"babip":0.276,"swstr":11.6,"mlbam_id":682928},{"name":"Xander Bogaerts","team":"SD","age":32,"pos":"SS","ab":421,"pa":481,"avg":0.257,"obp":0.328,"slg":0.412,"ops":0.74,"hr":16,"rbi":64,"sb":4,"wrc_plus":106,"xwoba":0.322,"woba":0.316,"brl_pct":8.6,"ev":89.1,"k_pct":18.5,"bb_pct":10.8,"war":2.0,"xba":0.244,"xslg":0.388,"hard_hit":39.6,"sprint_spd":26.2,"iso":0.155,"babip":0.268,"swstr":9.8,"mlbam_id":593428},{"name":"Michael Busch","team":"CHC","age":27,"pos":"1B","ab":415,"pa":490,"avg":0.244,"obp":0.332,"slg":0.444,"ops":0.776,"hr":24,"rbi":74,"sb":4,"wrc_plus":116,"xwoba":0.338,"woba":0.334,"brl_pct":13.8,"ev":91.2,"k_pct":25.2,"bb_pct":12.6,"war":2.2,"xba":0.232,"xslg":0.418,"hard_hit":42.6,"sprint_spd":26.8,"iso":0.2,"babip":0.244,"swstr":12.4,"mlbam_id":683737},{"name":"Daulton Varsho","team":"TOR","age":28,"pos":"CF","ab":408,"pa":470,"avg":0.224,"obp":0.306,"slg":0.414,"ops":0.72,"hr":22,"rbi":68,"sb":14,"wrc_plus":100,"xwoba":0.318,"woba":0.314,"brl_pct":11.2,"ev":90.4,"k_pct":25.7,"bb_pct":11.6,"war":2.4,"xba":0.213,"xslg":0.39,"hard_hit":41.4,"sprint_spd":28.4,"iso":0.19,"babip":0.218,"swstr":13.4,"mlbam_id":662139},{"name":"Max Muncy","team":"LAD","age":34,"pos":"1B","ab":394,"pa":488,"avg":0.21,"obp":0.334,"slg":0.45,"ops":0.784,"hr":26,"rbi":72,"sb":2,"wrc_plus":120,"xwoba":0.336,"woba":0.33,"brl_pct":15.6,"ev":91.4,"k_pct":25.5,"bb_pct":15.6,"war":2.2,"xba":0.198,"xslg":0.422,"hard_hit":44.8,"sprint_spd":24.6,"iso":0.24,"babip":0.196,"swstr":13.1,"mlbam_id":594998},{"name":"Jorge Soler","team":"MIA","age":33,"pos":"DH","ab":296,"pa":354,"avg":0.232,"obp":0.318,"slg":0.454,"ops":0.772,"hr":20,"rbi":58,"sb":2,"wrc_plus":114,"xwoba":0.332,"woba":0.328,"brl_pct":16.8,"ev":92.4,"k_pct":28.4,"bb_pct":11.4,"war":1.2,"xba":0.22,"xslg":0.428,"hard_hit":46.2,"sprint_spd":24.2,"iso":0.222,"babip":0.222,"swstr":14.6,"mlbam_id":506989},{"name":"Spencer Steer","team":"CIN","age":28,"pos":"1B","ab":425,"pa":494,"avg":0.248,"obp":0.328,"slg":0.432,"ops":0.76,"hr":20,"rbi":72,"sb":8,"wrc_plus":112,"xwoba":0.33,"woba":0.326,"brl_pct":11.6,"ev":90.4,"k_pct":22.9,"bb_pct":11.3,"war":2.4,"xba":0.236,"xslg":0.408,"hard_hit":41.2,"sprint_spd":27.2,"iso":0.184,"babip":0.254,"swstr":11.4,"mlbam_id":681919},{"name":"Colton Cowser","team":"BAL","age":25,"pos":"LF","ab":362,"pa":434,"avg":0.238,"obp":0.328,"slg":0.428,"ops":0.756,"hr":18,"rbi":62,"sb":8,"wrc_plus":110,"xwoba":0.33,"woba":0.326,"brl_pct":12.2,"ev":90.8,"k_pct":25.0,"bb_pct":12.9,"war":2.0,"xba":0.226,"xslg":0.404,"hard_hit":41.4,"sprint_spd":28.2,"iso":0.19,"babip":0.24,"swstr":12.4,"mlbam_id":681297},{"name":"James Wood","team":"WSH","age":23,"pos":"RF","ab":408,"pa":476,"avg":0.256,"obp":0.338,"slg":0.464,"ops":0.802,"hr":22,"rbi":72,"sb":12,"wrc_plus":122,"xwoba":0.342,"woba":0.338,"brl_pct":12.4,"ev":91.4,"k_pct":26.1,"bb_pct":12.4,"war":2.4,"xba":0.244,"xslg":0.436,"hard_hit":43.2,"sprint_spd":28.6,"iso":0.208,"babip":0.258,"swstr":13.2,"mlbam_id":694844},{"name":"Junior Caminero","team":"TB","age":22,"pos":"3B","ab":334,"pa":390,"avg":0.248,"obp":0.316,"slg":0.464,"ops":0.78,"hr":20,"rbi":64,"sb":6,"wrc_plus":116,"xwoba":0.338,"woba":0.334,"brl_pct":14.2,"ev":91.8,"k_pct":26.9,"bb_pct":11.0,"war":2.0,"xba":0.236,"xslg":0.436,"hard_hit":43.2,"sprint_spd":27.8,"iso":0.216,"babip":0.248,"swstr":13.6,"mlbam_id":687137},{"name":"Bo Bichette","team":"TOR","age":27,"pos":"SS","ab":499,"pa":554,"avg":0.274,"obp":0.328,"slg":0.448,"ops":0.776,"hr":20,"rbi":80,"sb":12,"wrc_plus":112,"xwoba":0.335,"woba":0.331,"brl_pct":9.8,"ev":90.2,"k_pct":21.1,"bb_pct":8.8,"war":2.8,"xba":0.261,"xslg":0.421,"hard_hit":40.6,"sprint_spd":27.2,"iso":0.174,"babip":0.286,"swstr":10.8,"mlbam_id":666182},{"name":"Lawrence Butler","team":"OAK","age":25,"pos":"LF","ab":405,"pa":462,"avg":0.25,"obp":0.318,"slg":0.444,"ops":0.762,"hr":20,"rbi":68,"sb":14,"wrc_plus":108,"xwoba":0.326,"woba":0.322,"brl_pct":12.1,"ev":90.6,"k_pct":26.2,"bb_pct":11.1,"war":2.0,"xba":0.238,"xslg":0.418,"hard_hit":41.8,"sprint_spd":28.8,"iso":0.194,"babip":0.254,"swstr":12.8,"mlbam_id":669169},{"name":"Nick Castellanos","team":"PHI","age":33,"pos":"RF","ab":456,"pa":506,"avg":0.262,"obp":0.318,"slg":0.438,"ops":0.756,"hr":20,"rbi":78,"sb":4,"wrc_plus":108,"xwoba":0.322,"woba":0.318,"brl_pct":11.2,"ev":90.8,"k_pct":22.1,"bb_pct":8.2,"war":1.8,"xba":0.25,"xslg":0.414,"hard_hit":41.6,"sprint_spd":26.2,"iso":0.176,"babip":0.27,"swstr":10.8,"mlbam_id":592206},{"name":"Masyn Winn","team":"STL","age":23,"pos":"SS","ab":440,"pa":500,"avg":0.254,"obp":0.316,"slg":0.404,"ops":0.72,"hr":14,"rbi":62,"sb":18,"wrc_plus":98,"xwoba":0.312,"woba":0.308,"brl_pct":8.2,"ev":89.2,"k_pct":20.7,"bb_pct":9.2,"war":2.4,"xba":0.242,"xslg":0.382,"hard_hit":38.4,"sprint_spd":29.2,"iso":0.15,"babip":0.27,"swstr":10.2,"mlbam_id":682648},{"name":"Jeff McNeil","team":"NYM","age":33,"pos":"2B","ab":412,"pa":465,"avg":0.254,"obp":0.318,"slg":0.384,"ops":0.702,"hr":10,"rbi":52,"sb":8,"wrc_plus":96,"xwoba":0.312,"woba":0.308,"brl_pct":4.8,"ev":87.2,"k_pct":15.5,"bb_pct":9.8,"war":1.8,"xba":0.244,"xslg":0.366,"hard_hit":35.8,"sprint_spd":26.8,"iso":0.13,"babip":0.278,"swstr":7.8,"mlbam_id":659241},{"name":"Sean Murphy","team":"ATL","age":30,"pos":"C","ab":392,"pa":462,"avg":0.234,"obp":0.318,"slg":0.418,"ops":0.736,"hr":18,"rbi":62,"sb":2,"wrc_plus":104,"xwoba":0.318,"woba":0.314,"brl_pct":11.6,"ev":90.4,"k_pct":23.3,"bb_pct":12.5,"war":2.4,"xba":0.222,"xslg":0.394,"hard_hit":41.2,"sprint_spd":25.4,"iso":0.184,"babip":0.238,"swstr":11.4,"mlbam_id":605144},{"name":"Triston Casas","team":"BOS","age":25,"pos":"1B","ab":312,"pa":382,"avg":0.238,"obp":0.342,"slg":0.438,"ops":0.78,"hr":18,"rbi":62,"sb":0,"wrc_plus":116,"xwoba":0.336,"woba":0.332,"brl_pct":13.8,"ev":91.0,"k_pct":24.2,"bb_pct":14.4,"war":2.0,"xba":0.226,"xslg":0.412,"hard_hit":42.4,"sprint_spd":24.8,"iso":0.2,"babip":0.238,"swstr":12.8,"mlbam_id":672179},{"name":"Patrick Bailey","team":"SFG","age":26,"pos":"C","ab":347,"pa":401,"avg":0.22,"obp":0.296,"slg":0.352,"ops":0.648,"hr":10,"rbi":46,"sb":2,"wrc_plus":82,"xwoba":0.278,"woba":0.274,"brl_pct":6.8,"ev":88.4,"k_pct":20.3,"bb_pct":10.6,"war":1.6,"xba":0.209,"xslg":0.334,"hard_hit":36.8,"sprint_spd":25.8,"iso":0.132,"babip":0.236,"swstr":10.2,"mlbam_id":682586},{"name":"Cedric Mullins","team":"BAL","age":30,"pos":"CF","ab":411,"pa":463,"avg":0.242,"obp":0.298,"slg":0.384,"ops":0.682,"hr":14,"rbi":56,"sb":24,"wrc_plus":92,"xwoba":0.302,"woba":0.298,"brl_pct":8.4,"ev":88.8,"k_pct":20.9,"bb_pct":9.0,"war":2.1,"xba":0.23,"xslg":0.362,"hard_hit":38.4,"sprint_spd":29.6,"iso":0.142,"babip":0.258,"swstr":10.8,"mlbam_id":656775},{"name":"Andrew Vaughn","team":"CWS","age":27,"pos":"RF","ab":388,"pa":446,"avg":0.246,"obp":0.316,"slg":0.412,"ops":0.728,"hr":16,"rbi":60,"sb":4,"wrc_plus":100,"xwoba":0.314,"woba":0.31,"brl_pct":10.4,"ev":90.2,"k_pct":23.1,"bb_pct":10.7,"war":1.4,"xba":0.234,"xslg":0.388,"hard_hit":40.4,"sprint_spd":25.6,"iso":0.166,"babip":0.254,"swstr":11.4,"mlbam_id":683734},{"name":"Willson Contreras","team":"STL","age":33,"pos":"C","ab":366,"pa":426,"avg":0.224,"obp":0.31,"slg":0.386,"ops":0.696,"hr":14,"rbi":56,"sb":2,"wrc_plus":94,"xwoba":0.302,"woba":0.298,"brl_pct":10.2,"ev":89.8,"k_pct":24.0,"bb_pct":11.1,"war":1.4,"xba":0.214,"xslg":0.366,"hard_hit":40.1,"sprint_spd":24.6,"iso":0.162,"babip":0.228,"swstr":12.2,"mlbam_id":543618},{"name":"Tyler Soderstrom","team":"OAK","age":23,"pos":"1B","ab":373,"pa":422,"avg":0.248,"obp":0.314,"slg":0.432,"ops":0.746,"hr":18,"rbi":64,"sb":4,"wrc_plus":102,"xwoba":0.316,"woba":0.312,"brl_pct":12.4,"ev":91.2,"k_pct":24.8,"bb_pct":9.2,"war":1.4,"xba":0.236,"xslg":0.408,"hard_hit":42.0,"sprint_spd":25.4,"iso":0.184,"babip":0.252,"swstr":12.8,"mlbam_id":680617},{"name":"Adolis Garcia","team":"TEX","age":32,"pos":"RF","ab":450,"pa":500,"avg":0.248,"obp":0.302,"slg":0.448,"ops":0.75,"hr":26,"rbi":84,"sb":16,"wrc_plus":106,"xwoba":0.316,"woba":0.312,"brl_pct":13.2,"ev":90.8,"k_pct":26.4,"bb_pct":7.3,"war":2.0,"xba":0.235,"xslg":0.422,"hard_hit":43.0,"sprint_spd":28.6,"iso":0.2,"babip":0.248,"swstr":13.2,"mlbam_id":666078},{"name":"Jorge Polanco","team":"SEA","age":31,"pos":"2B","ab":373,"pa":428,"avg":0.244,"obp":0.318,"slg":0.408,"ops":0.726,"hr":16,"rbi":58,"sb":4,"wrc_plus":100,"xwoba":0.314,"woba":0.31,"brl_pct":10.2,"ev":89.8,"k_pct":22.8,"bb_pct":10.2,"war":1.6,"xba":0.232,"xslg":0.386,"hard_hit":40.2,"sprint_spd":25.8,"iso":0.164,"babip":0.252,"swstr":11.4,"mlbam_id":593871},{"name":"Max Kepler","team":"PHI","age":32,"pos":"RF","ab":296,"pa":340,"avg":0.224,"obp":0.296,"slg":0.382,"ops":0.678,"hr":12,"rbi":44,"sb":4,"wrc_plus":84,"xwoba":0.284,"woba":0.28,"brl_pct":9.2,"ev":88.8,"k_pct":24.4,"bb_pct":9.8,"war":0.8,"xba":0.214,"xslg":0.362,"hard_hit":38.4,"sprint_spd":26.4,"iso":0.158,"babip":0.228,"swstr":12.2,"mlbam_id":596146},{"name":"Joc Pederson","team":"ARI","age":33,"pos":"LF","ab":270,"pa":321,"avg":0.224,"obp":0.322,"slg":0.408,"ops":0.73,"hr":14,"rbi":46,"sb":2,"wrc_plus":104,"xwoba":0.318,"woba":0.314,"brl_pct":12.4,"ev":90.2,"k_pct":25.2,"bb_pct":14.1,"war":1.0,"xba":0.212,"xslg":0.384,"hard_hit":41.2,"sprint_spd":24.8,"iso":0.184,"babip":0.218,"swstr":13.4,"mlbam_id":592626},{"name":"Evan Carter","team":"TEX","age":22,"pos":"LF","ab":302,"pa":362,"avg":0.244,"obp":0.332,"slg":0.412,"ops":0.744,"hr":14,"rbi":52,"sb":12,"wrc_plus":108,"xwoba":0.326,"woba":0.322,"brl_pct":10.4,"ev":90.2,"k_pct":25.5,"bb_pct":12.5,"war":1.6,"xba":0.232,"xslg":0.388,"hard_hit":40.8,"sprint_spd":29.4,"iso":0.168,"babip":0.25,"swstr":12.8,"mlbam_id":682993},{"name":"Jesse Winker","team":"NYM","age":31,"pos":"LF","ab":278,"pa":340,"avg":0.238,"obp":0.348,"slg":0.41,"ops":0.758,"hr":12,"rbi":48,"sb":2,"wrc_plus":110,"xwoba":0.328,"woba":0.324,"brl_pct":11.2,"ev":89.8,"k_pct":21.4,"bb_pct":14.2,"war":1.0,"xba":0.226,"xslg":0.388,"hard_hit":40.4,"sprint_spd":24.6,"iso":0.172,"babip":0.244,"swstr":11.4,"mlbam_id":608385},{"name":"Jose Abreu","team":"HOU","age":38,"pos":"1B","ab":290,"pa":326,"avg":0.224,"obp":0.278,"slg":0.368,"ops":0.646,"hr":12,"rbi":48,"sb":0,"wrc_plus":74,"xwoba":0.274,"woba":0.27,"brl_pct":9.8,"ev":90.4,"k_pct":22.8,"bb_pct":7.4,"war":0.4,"xba":0.212,"xslg":0.348,"hard_hit":41.0,"sprint_spd":23.8,"iso":0.144,"babip":0.228,"swstr":11.8,"mlbam_id":547989}];
const SEED_P25 = [{"name":"Paul Skenes","team":"PIT","age":23,"g":33,"gs":33,"ip":196,"era":1.96,"fip":2.34,"xfip":2.48,"whip":0.92,"k9":13.2,"bb9":2.4,"k_pct":36.1,"bb_pct":6.8,"hr9":0.6,"war":9.1,"swstr":16.8,"velo":98.6,"gb_pct":42.1,"brl_pct":4.3,"ev":85.1,"whiff":38.4,"xera":2.21,"lob":78.4,"role":"SP","mlbam_id":694973},{"name":"Tarik Skubal","team":"DET","age":28,"g":34,"gs":34,"ip":204,"era":2.39,"fip":2.62,"xfip":2.74,"whip":0.98,"k9":11.8,"bb9":1.8,"k_pct":30.8,"bb_pct":5.2,"hr9":0.7,"war":8.2,"swstr":15.4,"velo":95.4,"gb_pct":40.8,"brl_pct":5.1,"ev":86.2,"whiff":34.6,"xera":2.58,"lob":76.2,"role":"SP","mlbam_id":669373},{"name":"Zack Wheeler","team":"PHI","age":35,"g":34,"gs":34,"ip":208,"era":2.44,"fip":2.78,"xfip":2.88,"whip":0.96,"k9":10.8,"bb9":1.9,"k_pct":28.6,"bb_pct":5.4,"hr9":0.7,"war":7.8,"swstr":14.6,"velo":97.2,"gb_pct":43.2,"brl_pct":5.6,"ev":86.9,"whiff":31.8,"xera":2.68,"lob":74.8,"role":"SP","mlbam_id":554430},{"name":"Gerrit Cole","team":"NYY","age":34,"g":33,"gs":33,"ip":194,"era":2.54,"fip":2.72,"xfip":2.84,"whip":0.96,"k9":11.4,"bb9":2.1,"k_pct":30.2,"bb_pct":6.1,"hr9":0.8,"war":7.2,"swstr":15.1,"velo":96.8,"gb_pct":38.4,"brl_pct":6.1,"ev":87.4,"whiff":33.2,"xera":2.68,"lob":74.1,"role":"SP","mlbam_id":543037},{"name":"Spencer Strider","team":"ATL","age":27,"g":32,"gs":32,"ip":188,"era":2.62,"fip":2.88,"xfip":2.96,"whip":0.98,"k9":12.8,"bb9":2.4,"k_pct":33.8,"bb_pct":7.6,"hr9":0.7,"war":7.0,"swstr":16.2,"velo":98.2,"gb_pct":36.8,"brl_pct":5.2,"ev":86.1,"whiff":37.4,"xera":2.78,"lob":75.6,"role":"SP","mlbam_id":675911},{"name":"Logan Webb","team":"SFG","age":28,"g":36,"gs":36,"ip":221,"era":2.88,"fip":3.02,"xfip":3.14,"whip":1.04,"k9":8.8,"bb9":1.9,"k_pct":22.8,"bb_pct":5.2,"hr9":0.6,"war":6.2,"swstr":12.8,"velo":91.2,"gb_pct":52.8,"brl_pct":4.6,"ev":86.8,"whiff":26.8,"xera":3.01,"lob":74.8,"role":"SP","mlbam_id":657277},{"name":"Tyler Glasnow","team":"LAD","age":32,"g":31,"gs":31,"ip":182,"era":2.74,"fip":2.84,"xfip":2.96,"whip":0.98,"k9":12.4,"bb9":3.1,"k_pct":32.1,"bb_pct":9.0,"hr9":0.6,"war":6.8,"swstr":15.8,"velo":97.4,"gb_pct":37.2,"brl_pct":5.4,"ev":86.6,"whiff":35.8,"xera":2.88,"lob":76.2,"role":"SP","mlbam_id":607192},{"name":"Corbin Burnes","team":"BAL","age":31,"g":33,"gs":33,"ip":198,"era":2.84,"fip":2.98,"xfip":3.08,"whip":1.01,"k9":10.4,"bb9":2.1,"k_pct":27.1,"bb_pct":6.1,"hr9":0.7,"war":6.4,"swstr":14.2,"velo":94.8,"gb_pct":46.4,"brl_pct":5.4,"ev":86.9,"whiff":30.8,"xera":3.01,"lob":74.2,"role":"SP","mlbam_id":669203},{"name":"Chris Sale","team":"ATL","age":36,"g":31,"gs":31,"ip":184,"era":2.94,"fip":3.04,"xfip":3.16,"whip":0.98,"k9":10.8,"bb9":2.1,"k_pct":27.4,"bb_pct":5.8,"hr9":0.8,"war":6.0,"swstr":14.6,"velo":93.4,"gb_pct":38.8,"brl_pct":5.6,"ev":87.0,"whiff":32.4,"xera":2.98,"lob":74.4,"role":"SP","mlbam_id":519242},{"name":"Kevin Gausman","team":"TOR","age":34,"g":34,"gs":34,"ip":202,"era":3.04,"fip":3.12,"xfip":3.22,"whip":1.04,"k9":10.4,"bb9":2.1,"k_pct":27.6,"bb_pct":6.1,"hr9":0.8,"war":5.8,"swstr":13.8,"velo":93.8,"gb_pct":40.2,"brl_pct":6.2,"ev":87.4,"whiff":30.4,"xera":3.14,"lob":73.8,"role":"SP","mlbam_id":502043},{"name":"Cole Ragans","team":"KC","age":27,"g":31,"gs":31,"ip":182,"era":3.14,"fip":3.08,"xfip":3.22,"whip":1.08,"k9":11.2,"bb9":2.9,"k_pct":28.8,"bb_pct":8.0,"hr9":0.7,"war":5.4,"swstr":14.4,"velo":95.2,"gb_pct":44.2,"brl_pct":5.6,"ev":86.8,"whiff":32.8,"xera":3.16,"lob":72.8,"role":"SP","mlbam_id":666142},{"name":"Sonny Gray","team":"STL","age":35,"g":31,"gs":31,"ip":182,"era":3.12,"fip":3.22,"xfip":3.34,"whip":1.04,"k9":9.8,"bb9":2.4,"k_pct":25.8,"bb_pct":6.8,"hr9":0.8,"war":5.2,"swstr":13.4,"velo":93.8,"gb_pct":44.8,"brl_pct":5.4,"ev":87.1,"whiff":29.8,"xera":3.18,"lob":73.4,"role":"SP","mlbam_id":543243},{"name":"Pablo Lopez","team":"MIN","age":29,"g":33,"gs":33,"ip":198,"era":3.08,"fip":3.18,"xfip":3.28,"whip":1.04,"k9":9.8,"bb9":2.0,"k_pct":25.6,"bb_pct":5.8,"hr9":0.8,"war":5.6,"swstr":13.2,"velo":93.2,"gb_pct":42.8,"brl_pct":5.8,"ev":87.2,"whiff":28.6,"xera":3.21,"lob":73.2,"role":"SP","mlbam_id":641154},{"name":"Framber Valdez","team":"HOU","age":31,"g":35,"gs":35,"ip":208,"era":3.28,"fip":3.38,"xfip":3.44,"whip":1.08,"k9":8.6,"bb9":2.4,"k_pct":22.4,"bb_pct":7.0,"hr9":0.6,"war":4.8,"swstr":11.8,"velo":94.4,"gb_pct":56.4,"brl_pct":4.0,"ev":85.6,"whiff":25.4,"xera":3.32,"lob":74.2,"role":"SP","mlbam_id":664285},{"name":"Dylan Cease","team":"SD","age":29,"g":31,"gs":31,"ip":184,"era":3.18,"fip":3.28,"xfip":3.38,"whip":1.12,"k9":10.4,"bb9":3.4,"k_pct":27.4,"bb_pct":9.2,"hr9":0.8,"war":4.8,"swstr":14.2,"velo":96.4,"gb_pct":42.4,"brl_pct":6.2,"ev":87.4,"whiff":31.4,"xera":3.24,"lob":72.8,"role":"SP","mlbam_id":656302},{"name":"Seth Lugo","team":"KC","age":35,"g":32,"gs":32,"ip":190,"era":3.38,"fip":3.44,"xfip":3.52,"whip":1.08,"k9":8.8,"bb9":2.1,"k_pct":22.8,"bb_pct":5.8,"hr9":0.9,"war":4.1,"swstr":12.4,"velo":93.4,"gb_pct":44.6,"brl_pct":6.1,"ev":87.6,"whiff":26.4,"xera":3.41,"lob":73.6,"role":"SP","mlbam_id":607625},{"name":"Blake Snell","team":"SFG","age":32,"g":29,"gs":29,"ip":168,"era":3.24,"fip":3.38,"xfip":3.48,"whip":1.12,"k9":11.8,"bb9":4.1,"k_pct":30.6,"bb_pct":11.1,"hr9":0.7,"war":5.0,"swstr":15.4,"velo":96.2,"gb_pct":40.4,"brl_pct":5.9,"ev":87.6,"whiff":35.8,"xera":3.28,"lob":72.4,"role":"SP","mlbam_id":605483},{"name":"Bailey Ober","team":"MIN","age":29,"g":30,"gs":30,"ip":178,"era":3.48,"fip":3.62,"xfip":3.72,"whip":1.04,"k9":9.0,"bb9":1.8,"k_pct":23.4,"bb_pct":5.1,"hr9":1.0,"war":4.0,"swstr":12.2,"velo":92.2,"gb_pct":38.8,"brl_pct":7.1,"ev":88.1,"whiff":26.1,"xera":3.54,"lob":72.8,"role":"SP","mlbam_id":682015},{"name":"Tanner Bibee","team":"CLE","age":26,"g":30,"gs":30,"ip":176,"era":3.54,"fip":3.68,"xfip":3.78,"whip":1.08,"k9":9.2,"bb9":2.4,"k_pct":23.8,"bb_pct":6.6,"hr9":0.9,"war":3.8,"swstr":12.4,"velo":93.8,"gb_pct":40.8,"brl_pct":6.4,"ev":87.8,"whiff":27.1,"xera":3.61,"lob":72.2,"role":"SP","mlbam_id":691216},{"name":"Grayson Rodriguez","team":"BAL","age":26,"g":29,"gs":29,"ip":172,"era":3.58,"fip":3.64,"xfip":3.74,"whip":1.14,"k9":10.4,"bb9":3.2,"k_pct":27.2,"bb_pct":8.6,"hr9":0.8,"war":3.4,"swstr":13.6,"velo":95.8,"gb_pct":42.4,"brl_pct":6.2,"ev":87.2,"whiff":30.8,"xera":3.61,"lob":72.4,"role":"SP","mlbam_id":676945},{"name":"Cristopher Sanchez","team":"PHI","age":28,"g":30,"gs":30,"ip":178,"era":3.48,"fip":3.58,"xfip":3.68,"whip":1.12,"k9":9.0,"bb9":2.6,"k_pct":23.4,"bb_pct":7.2,"hr9":0.8,"war":3.6,"swstr":12.6,"velo":93.2,"gb_pct":48.4,"brl_pct":5.8,"ev":87.0,"whiff":27.4,"xera":3.54,"lob":73.2,"role":"SP","mlbam_id":587027},{"name":"Hunter Brown","team":"HOU","age":27,"g":29,"gs":29,"ip":172,"era":3.62,"fip":3.68,"xfip":3.78,"whip":1.12,"k9":9.2,"bb9":2.8,"k_pct":24.2,"bb_pct":7.8,"hr9":0.9,"war":3.6,"swstr":12.8,"velo":96.2,"gb_pct":40.2,"brl_pct":6.8,"ev":88.2,"whiff":27.6,"xera":3.58,"lob":72.4,"role":"SP","mlbam_id":686613},{"name":"Tanner Houck","team":"BOS","age":29,"g":29,"gs":29,"ip":168,"era":3.64,"fip":3.72,"xfip":3.82,"whip":1.14,"k9":9.4,"bb9":3.0,"k_pct":25.2,"bb_pct":8.1,"hr9":0.9,"war":3.4,"swstr":13.2,"velo":96.8,"gb_pct":46.2,"brl_pct":6.0,"ev":87.4,"whiff":29.2,"xera":3.68,"lob":72.1,"role":"SP","mlbam_id":682003},{"name":"Kyle Harrison","team":"SFG","age":25,"g":29,"gs":29,"ip":166,"era":3.72,"fip":3.84,"xfip":3.94,"whip":1.18,"k9":10.2,"bb9":3.8,"k_pct":26.4,"bb_pct":10.1,"hr9":0.7,"war":3.2,"swstr":13.8,"velo":94.6,"gb_pct":44.8,"brl_pct":5.8,"ev":87.0,"whiff":30.4,"xera":3.78,"lob":71.8,"role":"SP","mlbam_id":680461},{"name":"Mitch Keller","team":"PIT","age":29,"g":32,"gs":32,"ip":188,"era":3.74,"fip":3.82,"xfip":3.92,"whip":1.14,"k9":9.4,"bb9":2.6,"k_pct":24.6,"bb_pct":7.2,"hr9":0.9,"war":3.4,"swstr":12.8,"velo":94.2,"gb_pct":44.8,"brl_pct":6.6,"ev":87.6,"whiff":27.8,"xera":3.78,"lob":72.4,"role":"SP","mlbam_id":641745},{"name":"MacKenzie Gore","team":"WSH","age":27,"g":27,"gs":27,"ip":156,"era":3.74,"fip":3.84,"xfip":3.94,"whip":1.18,"k9":9.8,"bb9":3.6,"k_pct":25.8,"bb_pct":9.8,"hr9":0.9,"war":2.8,"swstr":13.2,"velo":95.4,"gb_pct":42.4,"brl_pct":6.8,"ev":87.6,"whiff":29.4,"xera":3.78,"lob":71.6,"role":"SP","mlbam_id":669022},{"name":"Ranger Suarez","team":"PHI","age":29,"g":28,"gs":28,"ip":162,"era":3.58,"fip":3.68,"xfip":3.78,"whip":1.14,"k9":8.4,"bb9":2.6,"k_pct":22.2,"bb_pct":7.2,"hr9":0.9,"war":3.2,"swstr":12.2,"velo":92.4,"gb_pct":48.8,"brl_pct":6.2,"ev":87.2,"whiff":25.8,"xera":3.64,"lob":72.8,"role":"SP","mlbam_id":624133},{"name":"Nathan Eovaldi","team":"TEX","age":35,"g":28,"gs":28,"ip":162,"era":3.68,"fip":3.78,"xfip":3.88,"whip":1.14,"k9":7.8,"bb9":1.9,"k_pct":20.4,"bb_pct":5.4,"hr9":1.0,"war":3.2,"swstr":11.4,"velo":96.4,"gb_pct":42.8,"brl_pct":7.6,"ev":88.6,"whiff":23.4,"xera":3.72,"lob":72.1,"role":"SP","mlbam_id":543135},{"name":"Lance Lynn","team":"STL","age":38,"g":28,"gs":28,"ip":162,"era":3.84,"fip":3.92,"xfip":4.02,"whip":1.18,"k9":8.6,"bb9":2.8,"k_pct":22.4,"bb_pct":7.4,"hr9":1.1,"war":2.8,"swstr":11.6,"velo":93.8,"gb_pct":44.2,"brl_pct":8.2,"ev":88.4,"whiff":24.8,"xera":3.88,"lob":71.4,"role":"SP","mlbam_id":458681},{"name":"Nestor Cortes","team":"NYY","age":30,"g":27,"gs":27,"ip":158,"era":3.84,"fip":3.94,"xfip":4.04,"whip":1.16,"k9":9.4,"bb9":2.8,"k_pct":24.8,"bb_pct":7.8,"hr9":1.0,"war":2.6,"swstr":12.8,"velo":89.8,"gb_pct":40.4,"brl_pct":7.2,"ev":87.8,"whiff":27.8,"xera":3.88,"lob":71.8,"role":"SP","mlbam_id":641482},{"name":"Michael Wacha","team":"SD","age":34,"g":26,"gs":26,"ip":152,"era":3.88,"fip":3.98,"xfip":4.08,"whip":1.18,"k9":8.8,"bb9":2.4,"k_pct":23.2,"bb_pct":6.8,"hr9":1.0,"war":2.4,"swstr":12.0,"velo":92.4,"gb_pct":42.8,"brl_pct":7.4,"ev":88.0,"whiff":25.8,"xera":3.94,"lob":71.2,"role":"SP","mlbam_id":608379},{"name":"JP Sears","team":"OAK","age":29,"g":26,"gs":26,"ip":152,"era":4.08,"fip":4.18,"xfip":4.28,"whip":1.24,"k9":8.8,"bb9":2.8,"k_pct":23.2,"bb_pct":7.8,"hr9":1.1,"war":1.8,"swstr":12.0,"velo":91.8,"gb_pct":38.4,"brl_pct":8.4,"ev":88.6,"whiff":26.4,"xera":4.14,"lob":70.8,"role":"SP","mlbam_id":676042},{"name":"Patrick Sandoval","team":"LAA","age":28,"g":27,"gs":27,"ip":158,"era":3.88,"fip":3.96,"xfip":4.06,"whip":1.16,"k9":9.4,"bb9":3.2,"k_pct":24.6,"bb_pct":8.6,"hr9":0.9,"war":2.8,"swstr":12.6,"velo":93.2,"gb_pct":44.6,"brl_pct":6.4,"ev":87.4,"whiff":27.8,"xera":3.92,"lob":72.2,"role":"SP","mlbam_id":663612},{"name":"Hayden Wesneski","team":"CHC","age":28,"g":26,"gs":26,"ip":148,"era":3.94,"fip":4.04,"xfip":4.14,"whip":1.18,"k9":9.4,"bb9":2.8,"k_pct":24.8,"bb_pct":7.8,"hr9":1.0,"war":2.0,"swstr":12.4,"velo":93.8,"gb_pct":40.8,"brl_pct":7.8,"ev":88.2,"whiff":27.8,"xera":3.98,"lob":71.4,"role":"SP","mlbam_id":681886},{"name":"Tyler Anderson","team":"LAA","age":35,"g":26,"gs":26,"ip":148,"era":4.14,"fip":4.24,"xfip":4.34,"whip":1.26,"k9":8.2,"bb9":2.8,"k_pct":21.8,"bb_pct":7.8,"hr9":1.1,"war":1.6,"swstr":11.2,"velo":91.2,"gb_pct":40.4,"brl_pct":8.6,"ev":88.8,"whiff":24.8,"xera":4.18,"lob":70.8,"role":"SP","mlbam_id":542881},{"name":"Emmanuel Clase","team":"CLE","age":27,"g":74,"gs":0,"ip":72,"era":1.84,"fip":1.92,"xfip":2.04,"whip":0.82,"k9":9.8,"bb9":1.4,"k_pct":29.6,"bb_pct":4.2,"hr9":0.3,"war":3.2,"swstr":15.8,"velo":100.8,"gb_pct":58.8,"brl_pct":4.6,"ev":85.8,"whiff":35.2,"xera":1.98,"lob":82.4,"role":"RP","mlbam_id":661403},{"name":"Edwin Diaz","team":"NYM","age":31,"g":68,"gs":0,"ip":66,"era":1.92,"fip":1.98,"xfip":2.08,"whip":0.84,"k9":14.2,"bb9":2.4,"k_pct":38.6,"bb_pct":6.8,"hr9":0.3,"war":2.8,"swstr":19.8,"velo":99.6,"gb_pct":38.8,"brl_pct":3.8,"ev":85.1,"whiff":44.2,"xera":2.04,"lob":84.2,"role":"RP","mlbam_id":621242},{"name":"Josh Hader","team":"HOU","age":31,"g":70,"gs":0,"ip":68,"era":2.08,"fip":1.98,"xfip":2.12,"whip":0.88,"k9":13.4,"bb9":2.8,"k_pct":36.2,"bb_pct":7.8,"hr9":0.4,"war":2.6,"swstr":19.2,"velo":95.8,"gb_pct":36.4,"brl_pct":4.2,"ev":85.4,"whiff":42.8,"xera":2.12,"lob":82.8,"role":"RP","mlbam_id":606500},{"name":"Ryan Helsley","team":"STL","age":30,"g":68,"gs":0,"ip":66,"era":2.18,"fip":2.08,"xfip":2.18,"whip":0.88,"k9":12.4,"bb9":2.1,"k_pct":33.4,"bb_pct":6.0,"hr9":0.3,"war":2.8,"swstr":18.2,"velo":100.2,"gb_pct":40.4,"brl_pct":4.1,"ev":85.2,"whiff":40.8,"xera":2.22,"lob":82.4,"role":"RP","mlbam_id":664854},{"name":"Felix Bautista","team":"BAL","age":30,"g":66,"gs":0,"ip":64,"era":2.12,"fip":2.04,"xfip":2.14,"whip":0.86,"k9":13.2,"bb9":2.4,"k_pct":35.4,"bb_pct":6.6,"hr9":0.3,"war":2.8,"swstr":19.8,"velo":100.4,"gb_pct":40.8,"brl_pct":3.9,"ev":84.9,"whiff":43.2,"xera":2.18,"lob":83.2,"role":"RP","mlbam_id":595879},{"name":"Andres Munoz","team":"SEA","age":26,"g":66,"gs":0,"ip":64,"era":2.24,"fip":2.18,"xfip":2.28,"whip":0.9,"k9":13.8,"bb9":3.2,"k_pct":37.2,"bb_pct":8.8,"hr9":0.3,"war":2.6,"swstr":19.4,"velo":99.8,"gb_pct":42.4,"brl_pct":3.8,"ev":84.8,"whiff":42.8,"xera":2.28,"lob":82.8,"role":"RP","mlbam_id":662253},{"name":"Paul Sewald","team":"ARI","age":35,"g":64,"gs":0,"ip":62,"era":2.38,"fip":2.44,"xfip":2.54,"whip":0.92,"k9":11.4,"bb9":2.4,"k_pct":30.6,"bb_pct":6.8,"hr9":0.4,"war":2.2,"swstr":16.8,"velo":94.4,"gb_pct":38.4,"brl_pct":4.8,"ev":85.8,"whiff":37.2,"xera":2.48,"lob":82.1,"role":"RP","mlbam_id":623568},{"name":"Jhoan Duran","team":"MIN","age":27,"g":64,"gs":0,"ip":62,"era":2.68,"fip":2.58,"xfip":2.68,"whip":0.96,"k9":12.4,"bb9":2.8,"k_pct":33.4,"bb_pct":7.8,"hr9":0.4,"war":2.2,"swstr":18.2,"velo":101.4,"gb_pct":44.4,"brl_pct":4.4,"ev":85.4,"whiff":40.4,"xera":2.72,"lob":80.8,"role":"RP","mlbam_id":661395},{"name":"Clay Holmes","team":"NYY","age":32,"g":70,"gs":0,"ip":68,"era":2.44,"fip":2.54,"xfip":2.64,"whip":0.96,"k9":9.8,"bb9":2.8,"k_pct":26.4,"bb_pct":7.8,"hr9":0.3,"war":2.4,"swstr":13.4,"velo":95.6,"gb_pct":58.4,"brl_pct":4.2,"ev":85.4,"whiff":29.8,"xera":2.48,"lob":81.2,"role":"RP","mlbam_id":605264},{"name":"Alexis Diaz","team":"CIN","age":29,"g":66,"gs":0,"ip":64,"era":2.24,"fip":2.18,"xfip":2.28,"whip":0.92,"k9":11.8,"bb9":3.2,"k_pct":31.8,"bb_pct":8.8,"hr9":0.3,"war":2.4,"swstr":17.2,"velo":98.4,"gb_pct":44.8,"brl_pct":4.4,"ev":85.6,"whiff":38.4,"xera":2.28,"lob":82.4,"role":"RP","mlbam_id":621242},{"name":"Robert Suarez","team":"SD","age":34,"g":64,"gs":0,"ip":62,"era":2.74,"fip":2.82,"xfip":2.92,"whip":0.96,"k9":11.4,"bb9":2.8,"k_pct":30.8,"bb_pct":7.8,"hr9":0.4,"war":2.0,"swstr":16.8,"velo":97.4,"gb_pct":42.4,"brl_pct":4.8,"ev":86.0,"whiff":37.4,"xera":2.78,"lob":80.8,"role":"RP","mlbam_id":660761},{"name":"Camilo Doval","team":"SFG","age":28,"g":64,"gs":0,"ip":62,"era":2.54,"fip":2.62,"xfip":2.72,"whip":0.96,"k9":11.8,"bb9":3.4,"k_pct":31.4,"bb_pct":9.2,"hr9":0.3,"war":2.2,"swstr":17.4,"velo":97.8,"gb_pct":42.4,"brl_pct":4.4,"ev":85.6,"whiff":38.4,"xera":2.58,"lob":81.4,"role":"RP","mlbam_id":666205},{"name":"Devin Williams","team":"NYY","age":30,"g":62,"gs":0,"ip":60,"era":2.68,"fip":2.62,"xfip":2.72,"whip":0.94,"k9":12.4,"bb9":3.8,"k_pct":33.2,"bb_pct":10.4,"hr9":0.3,"war":2.2,"swstr":18.4,"velo":95.2,"gb_pct":48.4,"brl_pct":4.0,"ev":85.0,"whiff":41.8,"xera":2.72,"lob":81.8,"role":"RP","mlbam_id":642207},{"name":"Jordan Romano","team":"TOR","age":32,"g":60,"gs":0,"ip":58,"era":2.78,"fip":2.84,"xfip":2.94,"whip":1.01,"k9":11.4,"bb9":3.2,"k_pct":30.6,"bb_pct":8.8,"hr9":0.5,"war":2.0,"swstr":16.4,"velo":96.4,"gb_pct":40.4,"brl_pct":4.8,"ev":86.2,"whiff":36.8,"xera":2.82,"lob":80.4,"role":"RP","mlbam_id":605447},{"name":"Evan Phillips","team":"LAD","age":31,"g":60,"gs":0,"ip":58,"era":2.84,"fip":2.92,"xfip":3.02,"whip":0.98,"k9":11.4,"bb9":2.4,"k_pct":30.6,"bb_pct":6.8,"hr9":0.5,"war":1.8,"swstr":16.2,"velo":95.4,"gb_pct":42.8,"brl_pct":5.0,"ev":86.2,"whiff":36.8,"xera":2.88,"lob":80.2,"role":"RP","mlbam_id":663689},{"name":"Brusdar Graterol","team":"LAD","age":27,"g":56,"gs":0,"ip":54,"era":2.84,"fip":2.94,"xfip":3.04,"whip":1.01,"k9":8.4,"bb9":2.4,"k_pct":22.8,"bb_pct":6.8,"hr9":0.3,"war":1.4,"swstr":11.4,"velo":100.4,"gb_pct":64.8,"brl_pct":4.4,"ev":85.4,"whiff":25.4,"xera":2.88,"lob":80.8,"role":"RP","mlbam_id":660813},{"name":"Pete Fairbanks","team":"TB","age":31,"g":62,"gs":0,"ip":60,"era":2.88,"fip":2.94,"xfip":3.04,"whip":0.98,"k9":12.0,"bb9":3.4,"k_pct":32.4,"bb_pct":9.2,"hr9":0.5,"war":1.8,"swstr":17.2,"velo":97.8,"gb_pct":40.4,"brl_pct":5.0,"ev":85.8,"whiff":38.8,"xera":2.92,"lob":80.4,"role":"RP","mlbam_id":664126},{"name":"Bryan Abreu","team":"HOU","age":27,"g":66,"gs":0,"ip":64,"era":2.94,"fip":3.02,"xfip":3.12,"whip":1.04,"k9":12.8,"bb9":4.2,"k_pct":34.4,"bb_pct":11.6,"hr9":0.4,"war":1.8,"swstr":17.8,"velo":98.8,"gb_pct":44.4,"brl_pct":4.8,"ev":85.8,"whiff":40.4,"xera":2.98,"lob":80.1,"role":"RP","mlbam_id":650556},{"name":"David Bednar","team":"PIT","age":31,"g":64,"gs":0,"ip":62,"era":2.98,"fip":3.04,"xfip":3.14,"whip":1.04,"k9":11.4,"bb9":3.2,"k_pct":30.8,"bb_pct":8.8,"hr9":0.6,"war":1.8,"swstr":16.2,"velo":95.8,"gb_pct":42.4,"brl_pct":5.4,"ev":86.4,"whiff":36.4,"xera":3.02,"lob":79.8,"role":"RP","mlbam_id":670280},{"name":"Matt Strahm","team":"PHI","age":33,"g":60,"gs":0,"ip":58,"era":2.94,"fip":3.04,"xfip":3.14,"whip":1.01,"k9":10.8,"bb9":2.8,"k_pct":29.2,"bb_pct":7.8,"hr9":0.5,"war":1.6,"swstr":15.4,"velo":94.2,"gb_pct":40.4,"brl_pct":5.2,"ev":86.4,"whiff":34.8,"xera":2.98,"lob":79.8,"role":"RP","mlbam_id":621385},{"name":"Seranthony Dominguez","team":"PHI","age":29,"g":58,"gs":0,"ip":56,"era":3.04,"fip":3.12,"xfip":3.22,"whip":1.04,"k9":11.4,"bb9":3.2,"k_pct":30.8,"bb_pct":8.8,"hr9":0.5,"war":1.4,"swstr":16.2,"velo":98.2,"gb_pct":42.4,"brl_pct":5.2,"ev":86.2,"whiff":36.4,"xera":3.08,"lob":79.4,"role":"RP","mlbam_id":622554},{"name":"Michael Kopech","team":"CHC","age":29,"g":58,"gs":0,"ip":56,"era":3.04,"fip":3.12,"xfip":3.22,"whip":1.04,"k9":12.4,"bb9":4.2,"k_pct":33.4,"bb_pct":11.6,"hr9":0.5,"war":1.6,"swstr":17.2,"velo":98.4,"gb_pct":38.8,"brl_pct":5.4,"ev":86.6,"whiff":39.4,"xera":3.08,"lob":79.2,"role":"RP","mlbam_id":656629},{"name":"AJ Minter","team":"ATL","age":32,"g":56,"gs":0,"ip":54,"era":3.08,"fip":3.16,"xfip":3.26,"whip":1.06,"k9":11.0,"bb9":3.4,"k_pct":29.6,"bb_pct":9.4,"hr9":0.5,"war":1.4,"swstr":15.4,"velo":96.2,"gb_pct":44.4,"brl_pct":5.2,"ev":86.2,"whiff":35.2,"xera":3.12,"lob":79.1,"role":"RP","mlbam_id":621345},{"name":"Joe Jimenez","team":"ATL","age":30,"g":60,"gs":0,"ip":58,"era":3.12,"fip":3.22,"xfip":3.32,"whip":1.06,"k9":10.8,"bb9":3.2,"k_pct":29.2,"bb_pct":8.8,"hr9":0.6,"war":1.2,"swstr":14.8,"velo":95.4,"gb_pct":40.4,"brl_pct":5.6,"ev":86.6,"whiff":33.4,"xera":3.18,"lob":78.8,"role":"RP","mlbam_id":641729},{"name":"Scott Barlow","team":"KC","age":32,"g":62,"gs":0,"ip":60,"era":3.24,"fip":3.34,"xfip":3.44,"whip":1.08,"k9":10.8,"bb9":3.2,"k_pct":29.2,"bb_pct":9.0,"hr9":0.6,"war":1.4,"swstr":15.2,"velo":94.6,"gb_pct":40.4,"brl_pct":5.6,"ev":86.8,"whiff":34.8,"xera":3.28,"lob":79.2,"role":"RP","mlbam_id":605130},{"name":"Caleb Ferguson","team":"LAD","age":29,"g":58,"gs":0,"ip":56,"era":3.24,"fip":3.34,"xfip":3.44,"whip":1.08,"k9":11.4,"bb9":3.8,"k_pct":30.6,"bb_pct":10.4,"hr9":0.6,"war":1.2,"swstr":15.6,"velo":95.8,"gb_pct":44.4,"brl_pct":5.4,"ev":86.2,"whiff":35.4,"xera":3.28,"lob":79.1,"role":"RP","mlbam_id":594815},{"name":"Gregory Soto","team":"PHI","age":29,"g":58,"gs":0,"ip":56,"era":3.38,"fip":3.44,"xfip":3.54,"whip":1.18,"k9":10.4,"bb9":5.2,"k_pct":28.2,"bb_pct":14.2,"hr9":0.5,"war":1.0,"swstr":14.4,"velo":98.2,"gb_pct":46.4,"brl_pct":5.2,"ev":86.4,"whiff":32.4,"xera":3.42,"lob":78.2,"role":"RP","mlbam_id":642469},{"name":"Carlos Estevez","team":"LAA","age":32,"g":60,"gs":0,"ip":58,"era":3.42,"fip":3.48,"xfip":3.58,"whip":1.12,"k9":10.4,"bb9":3.4,"k_pct":28.2,"bb_pct":9.4,"hr9":0.8,"war":1.2,"swstr":14.4,"velo":96.2,"gb_pct":40.4,"brl_pct":6.2,"ev":87.2,"whiff":32.4,"xera":3.44,"lob":78.4,"role":"RP","mlbam_id":608032},{"name":"Yimi Garcia","team":"TOR","age":34,"g":56,"gs":0,"ip":54,"era":3.48,"fip":3.58,"xfip":3.68,"whip":1.12,"k9":10.4,"bb9":3.4,"k_pct":28.2,"bb_pct":9.4,"hr9":0.8,"war":0.8,"swstr":14.2,"velo":93.8,"gb_pct":38.8,"brl_pct":6.8,"ev":87.6,"whiff":31.4,"xera":3.52,"lob":78.1,"role":"RP","mlbam_id":554340},{"name":"Kenley Jansen","team":"BOS","age":37,"g":58,"gs":0,"ip":56,"era":3.54,"fip":3.62,"xfip":3.72,"whip":1.08,"k9":11.2,"bb9":2.4,"k_pct":30.2,"bb_pct":6.8,"hr9":0.8,"war":0.8,"swstr":15.8,"velo":91.2,"gb_pct":32.4,"brl_pct":6.4,"ev":87.2,"whiff":35.8,"xera":3.58,"lob":78.4,"role":"RP","mlbam_id":445276},{"name":"Tyler Kinley","team":"COL","age":34,"g":54,"gs":0,"ip":52,"era":4.04,"fip":4.14,"xfip":4.24,"whip":1.28,"k9":9.8,"bb9":4.2,"k_pct":26.4,"bb_pct":11.6,"hr9":1.2,"war":0.2,"swstr":12.8,"velo":94.8,"gb_pct":38.8,"brl_pct":8.4,"ev":88.8,"whiff":29.8,"xera":4.08,"lob":76.4,"role":"RP","mlbam_id":641418}];


// ── DATA STORE ──────────────────────────────────────────────────────────────
const DB = {
  2025: { hitters: SEED_H25, pitchers: SEED_P25, loaded: true },
  2026: { hitters: [],       pitchers: [],        loaded: false },
};

// ── AXIS DEFINITIONS ────────────────────────────────────────────────────────
// dir: 1 = higher is better for that player type, -1 = lower is better
const H_AXES = [
  {k:"wrc_plus",  lbl:"wRC+",      src:"fg", d:"Weighted Runs Created+ (100 = lg avg)",       dir: 1},
  {k:"xwoba",     lbl:"xwOBA",     src:"sv", d:"Expected wOBA (Statcast)",                    dir: 1},
  {k:"woba",      lbl:"wOBA",      src:"fg", d:"Weighted On-Base Average",                    dir: 1},
  {k:"brl_pct",   lbl:"Barrel%",   src:"sv", d:"Barrel rate (optimal EV + launch angle)",     dir: 1},
  {k:"ev",        lbl:"Avg EV",    src:"sv", d:"Average exit velocity (mph)",                 dir: 1},
  {k:"k_pct",     lbl:"K%",        src:"fg", d:"Strikeout percentage",                        dir:-1},
  {k:"bb_pct",    lbl:"BB%",       src:"fg", d:"Walk percentage",                             dir: 1},
  {k:"war",       lbl:"WAR",       src:"fg", d:"Wins Above Replacement",                      dir: 1},
  {k:"xba",       lbl:"xBA",       src:"sv", d:"Expected batting average",                    dir: 1},
  {k:"xslg",      lbl:"xSLG",      src:"sv", d:"Expected slugging percentage",                dir: 1},
  {k:"hard_hit",  lbl:"Hard Hit%", src:"sv", d:"Exit velocity >= 95 mph rate",                dir: 1},
  {k:"sprint_spd",lbl:"Sprint Spd",src:"sv", d:"Sprint speed ft/s (27 = avg)",                dir: 1},
  {k:"ops",       lbl:"OPS",       src:"fg", d:"On-base plus slugging",                       dir: 1},
  {k:"hr",        lbl:"HR",        src:"fg", d:"Home runs",                                   dir: 1},
  {k:"sb",        lbl:"SB",        src:"fg", d:"Stolen bases",                                dir: 1},
  {k:"avg",       lbl:"AVG",       src:"fg", d:"Batting average",                             dir: 1},
  {k:"iso",       lbl:"ISO",       src:"fg", d:"Isolated power (SLG - AVG)",                  dir: 1},
  {k:"swstr",     lbl:"SwStr%",    src:"fg", d:"Swinging strike rate",                        dir:-1},
  {k:"babip",     lbl:"BABIP",     src:"fg", d:"Batting avg on balls in play",                dir: 1},
];
const P_AXES = [
  {k:"era",    lbl:"ERA",        src:"fg", d:"Earned run average",                            dir:-1},
  {k:"fip",    lbl:"FIP",        src:"fg", d:"Fielding Independent Pitching",                 dir:-1},
  {k:"xfip",   lbl:"xFIP",       src:"fg", d:"Expected FIP (normalises HR/FB)",               dir:-1},
  {k:"xera",   lbl:"xERA",       src:"sv", d:"Expected ERA (Statcast)",                       dir:-1},
  {k:"k_pct",  lbl:"K%",         src:"fg", d:"Strikeout percentage",                          dir: 1},
  {k:"bb_pct", lbl:"BB%",        src:"fg", d:"Walk percentage",                               dir:-1},
  {k:"brl_pct",lbl:"Barrel% ag.",src:"sv", d:"Barrel rate allowed",                           dir:-1},
  {k:"ev",     lbl:"Avg EV ag.", src:"sv", d:"Average exit velocity allowed (mph)",            dir:-1},
  {k:"whiff",  lbl:"Whiff%",     src:"sv", d:"Swing-and-miss rate",                           dir: 1},
  {k:"war",    lbl:"WAR",        src:"fg", d:"Wins Above Replacement",                        dir: 1},
  {k:"k9",     lbl:"K/9",        src:"fg", d:"Strikeouts per 9 innings",                      dir: 1},
  {k:"bb9",    lbl:"BB/9",       src:"fg", d:"Walks per 9 innings",                           dir:-1},
  {k:"whip",   lbl:"WHIP",       src:"fg", d:"Walks + hits per inning pitched",               dir:-1},
  {k:"swstr",  lbl:"SwStr%",     src:"fg", d:"Swinging strike rate",                          dir: 1},
  {k:"gb_pct", lbl:"GB%",        src:"fg", d:"Ground ball rate",                              dir: 1},
  {k:"lob",    lbl:"LOB%",       src:"fg", d:"Left-on-base percentage",                       dir: 1},
  {k:"velo",   lbl:"FB Velo",    src:"sv", d:"Average fastball velocity (mph)",                dir: 1},
];
const H_TIP = [
  {k:"hr",       lbl:"HR",   f:v=>v==null?"--":Math.round(v)},
  {k:"sb",       lbl:"SB",   f:v=>v==null?"--":Math.round(v)},
  {k:"wrc_plus", lbl:"wRC+", f:v=>v==null?"--":Math.round(v)},
];
const P_TIP = [
  {k:"k_pct",  lbl:"K%",  f:v=>v==null?"--":v.toFixed(1)+"%"},
  {k:"bb_pct", lbl:"BB%", f:v=>v==null?"--":v.toFixed(1)+"%"},
  {k:"era",    lbl:"ERA", f:v=>v==null?"--":v.toFixed(2)},
];

// ── STATE ────────────────────────────────────────────────────────────────────
let SEASON=2025, MODE="hitters", NAMES=false, QUADS=true, SCOL=null, SDIR=1;
let _fetching26=false;

// ── HELPERS ──────────────────────────────────────────────────────────────────
const mean = a => a.length ? a.reduce((s,v)=>s+v,0)/a.length : 0;
const fv   = v => v==null||isNaN(v) ? "--"
               : Math.abs(v)<1  ? v.toFixed(3)
               : Math.abs(v)<10 ? v.toFixed(2) : v.toFixed(1);
const nf   = v => { const f=parseFloat(v); return isNaN(f)?null:f; };

const axes = () => MODE==="hitters" ? H_AXES : P_AXES;
const tip  = () => MODE==="hitters" ? H_TIP  : P_TIP;
const dat  = () => DB[SEASON][MODE==="hitters"?"hitters":"pitchers"] || [];
const xk   = () => document.getElementById("x-sel").value;
const yk   = () => document.getElementById("y-sel").value;

// Quadrant color based on PERFORMANCE deviation (positive = better)
function qcol(px,py){
  if(px>=0&&py>=0) return "#047857";  // green: better at both
  if(px<0&&py>=0)  return "#1D4ED8";  // blue: better Y only
  if(px>=0&&py<0)  return "#C2410C";  // orange: better X only
  return "#B91C1C";                    // red: worse at both
}
function srcTag(s){
  return s==="fg"
    ? "<span class=\"src-tag tag-fg\">FanGraphs</span>"
    : "<span class=\"src-tag tag-sv\">Savant</span>";
}
function setProg(pct,msg){
  document.getElementById("fetch-fill").style.width = pct+"%";
  if(msg!==undefined) document.getElementById("fetch-msg").textContent = msg;
}
function showBar(v){
  document.getElementById("fetch-wrap").classList.toggle("hidden",!v);
}

// ── DATA FETCH PIPELINE ──────────────────────────────────────────────────────
// Strategy: Try DIRECT fetch first (many APIs serve CORS headers), then fall
// back through CORS proxies. This is faster and more reliable than always
// going through a third-party proxy service.

// Two-proxy chain — the previous 5-proxy list included unreliable/HTTP-only
// services (thingproxy, codetabs) and a redundant allorigins JSON-wrapper.
// Keep the two with the best track record + valid TLS; rely on the static
// data/*.json snapshot (refreshed daily by GitHub Actions) as the primary path.
const PROXIES = [
  { name:"corsproxy.io", url: u => "https://corsproxy.io/?"+encodeURIComponent(u) },
  { name:"allorigins",   url: u => "https://api.allorigins.win/raw?url="+encodeURIComponent(u) },
];
let _proxyIdx = 0;   // start with first proxy, rotate on failure
let _proxyFails = {}; // track consecutive failures per proxy
let _proxyOk = {};   // track successes for telemetry
let _directWorks = null; // null=untested, true/false=tested

// Expose proxy telemetry for debugging / quick health checks.
window.__proxyTelemetry = function(){
  return { fails: { ..._proxyFails }, ok: { ..._proxyOk }, directWorks: _directWorks };
};

// Detect if we're running from file:// or a hosted server (local or cloud)
const _isFileProtocol = location.protocol === 'file:';
const _isLocalServer  = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
// If served from ANY http(s) origin (localhost OR deployed), use same-origin proxy
// This works both locally (localhost:3000) and on Render/Railway/etc.
const _hasOwnServer = !_isFileProtocol && (location.protocol === 'http:' || location.protocol === 'https:');
const _localProxy = _hasOwnServer ? location.origin + '/proxy?url=' : null;

async function proxyFetch(url, retries=2){
  let lastErr;

  // ── ATTEMPT 0: Local proxy server (fastest, no CORS issues) ──
  if(_localProxy){
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 12000);
      const r = await fetch(_localProxy + encodeURIComponent(url), { signal: controller.signal });
      clearTimeout(timeout);
      if(r.ok){
        console.log(`[fetch] LOCAL PROXY success: ${url.slice(0,80)}...`);
        return r;
      }
      throw new Error("HTTP "+r.status);
    } catch(e){
      console.warn(`[fetch] Local proxy failed: ${e.message}. Falling back to CORS proxies.`);
    }
  }

  // ── ATTEMPT 1: Direct fetch (no proxy) ──
  // Skip on file:// protocol — CORS always blocks cross-origin fetch from file://
  if(!_isFileProtocol && _directWorks !== false){
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 6000);
      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if(r.ok){
        _directWorks = true;
        console.log(`[fetch] DIRECT success: ${url.slice(0,80)}...`);
        return r;
      }
      throw new Error("HTTP "+r.status);
    } catch(e){
      if(_directWorks === null){
        console.warn(`[fetch] Direct fetch failed (CORS likely blocked): ${e.message}. Switching to proxy mode.`);
        _directWorks = false;
      }
    }
  } else if(_isFileProtocol && _directWorks === null){
    console.log(`[fetch] file:// protocol detected — skipping direct fetch, using CORS proxies`);
    _directWorks = false;
  }

  // ── ATTEMPT 2: CORS proxy chain ──
  const maxAttempts = PROXIES.length * retries;
  for(let attempt=0; attempt < maxAttempts; attempt++){
    const proxy = PROXIES[_proxyIdx % PROXIES.length];
    // Skip proxies with 3+ recent consecutive failures (likely down)
    if((_proxyFails[proxy.name]||0) >= 3){
      _proxyIdx++;
      continue;
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 10000); // 10s timeout for proxies
      const r = await fetch(proxy.url(url), { signal: controller.signal });
      clearTimeout(timeout);
      if(!r.ok) throw new Error("HTTP "+r.status);
      _proxyFails[proxy.name] = 0; // reset fail count on success
      _proxyOk[proxy.name] = (_proxyOk[proxy.name]||0) + 1;
      console.log(`[fetch] Proxy ${proxy.name} success: ${url.slice(0,80)}...`);
      return r;
    } catch(e){
      lastErr = e;
      _proxyFails[proxy.name] = (_proxyFails[proxy.name]||0) + 1;
      console.warn(`[proxy] ${proxy.name} failed (attempt ${attempt+1}): ${e.message}`);
      _proxyIdx++; // rotate to next proxy
      // Brief pause before retry (150ms, no escalation)
      await new Promise(ok=>setTimeout(ok, 150));
    }
  }
  throw new Error("All CORS proxies failed after "+maxAttempts+" attempts. Last: "+lastErr?.message);
}

// ── Shared JSON parser that handles allorigins wrapper format ─────────────
// allorigins /get returns {status:{...}, contents:"...json..."} where contents
// is a string. The outer JSON.parse succeeds but .data is undefined → empty [].
// This helper detects and unwraps that format.
function parseProxyJSON(text, label){
  let j;
  try { j = JSON.parse(text); }
  catch(e){ throw new Error((label||"JSON")+" parse failed: "+text.slice(0,200)); }

  // Detect allorigins /get wrapper: {status:{...}, contents:"..."}
  if(j && typeof j.contents === 'string'){
    try { j = JSON.parse(j.contents); }
    catch(e){ throw new Error((label||"JSON")+" contents unwrap failed: "+j.contents.slice(0,200)); }
  }
  // Also handle {body:"..."} wrapper variant
  if(j && typeof j.body === 'string' && !j.data && !Array.isArray(j)){
    try { j = JSON.parse(j.body); }
    catch(e){ /* body wasn't JSON, keep j as-is */ }
  }

  // FG returns { data: [...] } or just an array depending on endpoint/version
  const rows = Array.isArray(j) ? j : (j.data || j.People || []);
  return rows;
}

// FanGraphs JSON leaderboard
// type: "bat" | "pit"
// qual: number of PA/IP, or "y" for FG default qualified
// opts.startdate / opts.enddate: optional YYYY-MM-DD date range filter
async function fetchFG(season, type, qual, opts){
  qual = qual || "y";
  opts = opts || {};
  // FanGraphs type=8 = Value/Dashboard (standard). pageitems=2000 to capture full roster,
  // especially early in season when qual thresholds are very low.
  let url = "https://www.fangraphs.com/api/leaders/major-league/data"
    + "?pos=all&stats="+type+"&lg=all&qual="+qual+"&type=8"
    + "&season="+season+"&season1="+season+"&ind=0&team=0&pageitems=2000&pagenum=1";
  // Append date range if provided — FG uses startdate/enddate + month=1000 for custom range
  if(opts.startdate && opts.enddate){
    url += "&month=1000&startdate="+opts.startdate+"&enddate="+opts.enddate;
    console.log(`[fetchFG] Date range: ${opts.startdate} → ${opts.enddate}`);
  }
  const r = await proxyFetch(url);
  const text = await r.text();
  const rows = parseProxyJSON(text, "FG-"+type);
  console.log(`[fetchFG] season=${season} type=${type} qual=${qual} → ${rows.length} rows`);
  return rows;
}

// Fetch FanGraphs Pitching+ / Stuff+ metrics (type=36) for a given season
// Returns array of {Name, Team, IP, "Stuff+", "Location+", "Pitching+", xMLBAMID, K%, BB%, ERA, FIP, WAR}
async function fetchFGStuffPlus(season){
  const url = "https://www.fangraphs.com/api/leaders/major-league/data"
    + "?pos=all&stats=pit&lg=all&qual=0&type=36"
    + "&season="+season+"&season1="+season+"&ind=0&team=0&pageitems=2000&pagenum=1";
  const r = await proxyFetch(url);
  const text = await r.text();
  const rows = parseProxyJSON(text, "FGStuff+");
  console.log(`[fetchFGStuffPlus] season=${season} → ${rows.length} rows`);
  return rows;
}

// Fetch FanGraphs plate discipline (type=7) for CSW%, SwStr%, O-Swing%, etc.
async function fetchFGDiscipline(season, type, qual){
  const url = "https://www.fangraphs.com/api/leaders/major-league/data"
    + "?pos=all&stats="+type+"&lg=all&qual="+(qual||"0")+"&type=7"
    + "&season="+season+"&season1="+season+"&ind=0&team=0&pageitems=2000&pagenum=1";
  const r = await proxyFetch(url);
  const text = await r.text();
  const rows = parseProxyJSON(text, "FGDisc-"+type);
  console.log(`[fetchFGDiscipline] season=${season} type=${type} → ${rows.length} rows`);
  return rows;
}

// ── Unwrap proxy text for CSV endpoints (allorigins wrapper) ─────────────
function unwrapProxyText(text){
  // If the proxy returned allorigins JSON wrapper, extract the CSV string
  if(text.charAt(0) === '{'){
    try {
      const wrap = JSON.parse(text);
      if(typeof wrap.contents === 'string') return wrap.contents;
      if(typeof wrap.body === 'string') return wrap.body;
    } catch(e){ /* not JSON, treat as raw CSV */ }
  }
  return text;
}

// ── SAVANT / STATCAST: ALTERNATIVE FETCH PIPELINE ───────────────────────────
// Per design: FanGraphs uses the CORS proxy chain above. Savant/Statcast uses
// a DIFFERENT pipeline: direct fetch first (Savant often allows CORS from HTTPS
// origins like GitHub Pages), then a dedicated set of fallback proxies separate
// from the FG chain, then MLB Stats API as a final backstop.

const SAVANT_PROXIES = [
  { name:"corsproxy.io",    url: u => "https://corsproxy.io/?"+encodeURIComponent(u) },
  { name:"allorigins-raw",  url: u => "https://api.allorigins.win/raw?url="+encodeURIComponent(u) },
  { name:"corsproxy.org",   url: u => "https://corsproxy.org/?"+encodeURIComponent(u) },
  { name:"allorigins-json", url: u => "https://api.allorigins.win/get?url="+encodeURIComponent(u) },
];
let _svProxyIdx = 0;
let _svProxyFails = {};
let _svDirectWorks = null; // null=untested, true=yes, false=no

async function savantFetch(url, retries=2){
  let lastErr;

  // ── Attempt 1: Direct fetch (no proxy) ──
  // Savant may serve CORS headers to HTTPS origins (e.g., GitHub Pages)
  if(!_isFileProtocol && _svDirectWorks !== false){
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 8000);
      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if(r.ok){
        _svDirectWorks = true;
        console.log(`[savant-fetch] DIRECT success: ${url.slice(0,80)}...`);
        return r;
      }
      throw new Error("HTTP "+r.status);
    } catch(e){
      if(_svDirectWorks === null){
        console.warn(`[savant-fetch] Direct fetch failed (${e.message}). Switching to Savant proxy chain.`);
        _svDirectWorks = false;
      }
    }
  }

  // ── Attempt 2: Dedicated Savant proxy chain (separate from FG proxies) ──
  const maxAttempts = SAVANT_PROXIES.length * retries;
  for(let attempt=0; attempt < maxAttempts; attempt++){
    const proxy = SAVANT_PROXIES[_svProxyIdx % SAVANT_PROXIES.length];
    if((_svProxyFails[proxy.name]||0) >= 3){
      _svProxyIdx++;
      continue;
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 12000);
      const r = await fetch(proxy.url(url), { signal: controller.signal });
      clearTimeout(timeout);
      if(!r.ok) throw new Error("HTTP "+r.status);
      _svProxyFails[proxy.name] = 0;
      console.log(`[savant-fetch] Proxy ${proxy.name} success: ${url.slice(0,80)}...`);
      return r;
    } catch(e){
      lastErr = e;
      _svProxyFails[proxy.name] = (_svProxyFails[proxy.name]||0) + 1;
      console.warn(`[savant-proxy] ${proxy.name} failed (attempt ${attempt+1}): ${e.message}`);
      _svProxyIdx++;
      await new Promise(ok=>setTimeout(ok, 200));
    }
  }
  throw new Error("All Savant proxies failed after "+maxAttempts+" attempts. Last: "+lastErr?.message);
}

// Savant CSV leaderboard (expected stats) — uses dedicated Savant pipeline
// minPA: numeric PA threshold, or "q" for Savant default qualified
async function fetchSavantXStats(season, type, minPA){
  minPA = minPA || "q";
  const url = "https://baseballsavant.mlb.com/leaderboard/expected_statistics"
    + "?type="+type+"&year="+season+"&position=&team=&min="+minPA+"&csv=true";
  const r = await savantFetch(url);
  const rawText = await r.text();
  const text = unwrapProxyText(rawText);
  return new Promise((res,rej) => {
    Papa.parse(text, {header:true, skipEmptyLines:true,
      complete: d => { console.log(`[SavantXStats] ${type} ${season}: ${d.data.length} rows`); res(d.data); },
      error: e => rej(e)});
  });
}

// Savant sprint speed CSV — uses dedicated Savant pipeline
async function fetchSavantSprint(season){
  const url = "https://baseballsavant.mlb.com/running_splits"
    + "?type=running&bats=&year="+season+"&position=&team=&min=10&csv=true";
  const r = await savantFetch(url);
  const rawText = await r.text();
  const text = unwrapProxyText(rawText);
  return new Promise((res,rej) => {
    Papa.parse(text, {header:true, skipEmptyLines:true,
      complete: d => { console.log(`[SavantSprint] ${season}: ${d.data.length} rows`); res(d.data); },
      error: ()=>res([])});
  });
}

// ── MLB STATS API FALLBACK ──────────────────────────────────────────────────
// Native CORS support — always works as final backstop for basic Statcast data.
// Returns player rows with MLBAM IDs for merging with FanGraphs data.
async function fetchMLBStatsAPI(season, group){
  // group: "hitting" or "pitching"
  const url = "https://statsapi.mlb.com/api/v1/stats"
    + "?stats=season&season="+season+"&group="+group+"&sportId=1"
    + "&limit=1000&offset=0&gameType=R"
    + "&fields=splits,stat,player,id,fullName,currentTeam,abbreviation";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 10000);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if(!r.ok) throw new Error("MLB API HTTP "+r.status);
    const data = await r.json();
    // Flatten: data.stats[0].splits[] → [{player_id, player_name, team, ...stats}]
    const splits = (data.stats && data.stats[0] && data.stats[0].splits) || [];
    const rows = splits.map(s => ({
      player_id: String(s.player?.id || ""),
      player_name: s.player?.fullName || "",
      team_name_abbrev: s.team?.abbreviation || "",
      ...s.stat
    }));
    console.log(`[MLBStatsAPI] ${group} ${season}: ${rows.length} rows`);
    return rows;
  } catch(e){
    console.error(`[MLBStatsAPI] ${group} fetch failed:`, e.message);
    return [];
  }
}

// ── NAME NORMALISATION (for fuzzy join FG ↔ Savant) ─────────────────────────
// Strips accents, suffixes (Jr, Sr, II, III, IV), periods, and normalises whitespace
function normName(s){
  if(!s) return "";
  return s.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")       // strip accents
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/gi,"")            // strip suffixes
    .replace(/[^a-z ]/g,"")                                 // keep only letters+spaces
    .replace(/\s+/g," ").trim();
}

// Savant uses "Last, First" format — convert to "First Last" for matching
function savantNameToNorm(raw){
  const parts = (raw||"").split(",").map(p=>p.trim());
  if(parts.length===2) return normName(parts[1]+" "+parts[0]);
  return normName(raw);
}

// Build lookup index; on collision (same norm name), keep the one with more data
function buildIdx(arr, normFn){
  const idx = {};
  arr.forEach(row => {
    const k = normFn(row);
    if(!k) return;
    // If duplicate key, keep the row with more non-empty fields
    if(idx[k]){
      const oldVals = Object.values(idx[k]).filter(v=>v!=null&&v!=="").length;
      const newVals = Object.values(row).filter(v=>v!=null&&v!=="").length;
      if(newVals <= oldVals) return;
    }
    idx[k] = row;
  });
  return idx;
}

// Secondary matching: try last-name-only match when full name fails
function fuzzyLookup(key, idx){
  if(idx[key]) return idx[key];
  // Try last-name match (risky for common names, so only if exactly one match)
  const parts = key.split(" ");
  if(parts.length >= 2){
    const lastName = parts[parts.length-1];
    const matches = Object.keys(idx).filter(k=>k.endsWith(" "+lastName) || k === lastName);
    if(matches.length === 1) return idx[matches[0]];
  }
  return null;
}

// pct: FG sends "22.4 %" or 22.4 ; Savant sends "0.224" or "22.4"
function pct(v){
  if(v==null||v==="") return null;
  const s = String(v).replace("%","").trim();
  const f = parseFloat(s);
  if(isNaN(f)) return null;
  return f>1 ? f : f*100;
}

// stripHTML: FanGraphs API returns Name as '<a href="/statss.aspx?playerid=...">Name</a>'
// Strip all HTML tags to get plain text name
function stripHTML(s){ return s ? String(s).replace(/<[^>]*>/g,"").trim() : ""; }

// ── STATCAST DATA FETCHING ──────────────────────────────────────────────────
// Cache for fetched Statcast data
const statcastCache = new Map();

// Helper: try direct fetch first, then proxy (with proper error handling)
async function fetchStatcastCSV(url){
  // Attempt 1: direct fetch (Savant sometimes allows CORS for CSV)
  // Short timeout — direct CORS almost never works; fail fast to reach proxy sooner
  try {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 3000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if(resp.ok){
      const text = await resp.text();
      if(text && !text.trim().startsWith("<") && text.includes(",")) return text;
    }
  } catch(e){
    console.warn(`[statcast] Direct fetch failed, trying proxy: ${e.message}`);
  }

  // Attempt 2: through CORS proxy (wrapped in try-catch)
  try {
    const resp = await proxyFetch(url);
    const text = await resp.text();
    if(!text || text.trim().startsWith("<")){
      console.warn(`[statcast] Non-CSV response for ${url.substring(0,80)}...`);
      return null;
    }
    return text;
  } catch(e){
    console.warn(`[statcast] All proxy attempts failed for ${url.substring(0,80)}...: ${e.message}`);
    return null;
  }
}

async function fetchPitcherStatcast(mlbamId, season) {
  if (!mlbamId) return null;
  const cacheKey = `pitcher_${mlbamId}_${season}`;
  if (statcastCache.has(cacheKey)) return statcastCache.get(cacheKey);

  try {
    // Fetch pitch-level data for this pitcher (needed for movement, location, arsenal charts)
    // hfGT=R%7C filters to Regular Season only (excludes Spring Training/Exhibition = much less data)
    const url = `https://baseballsavant.mlb.com/statcast_search/csv?type=details&player_type=pitcher&player_id=${mlbamId}&hfSea=${season}%7C&hfGT=R%7C&min_pitches=0&min_results=0`;
    console.log(`[statcast-pitcher] Fetching pitches for ID ${mlbamId} (${season})...`);
    const text = await fetchStatcastCSV(url);
    if(!text){
      console.warn(`[statcast-pitcher] No data returned for ID ${mlbamId} (${season})`);
      statcastCache.set(cacheKey, []);
      return [];
    }
    const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
    const data = (parsed.data || []).filter(r => r["pitch_type"]); // filter out junk rows
    console.log(`[statcast-pitcher] Got ${data.length} pitches for ID ${mlbamId} (${season})`);
    statcastCache.set(cacheKey, data);
    return data;
  } catch(e) {
    console.warn("Statcast pitcher fetch failed:", e);
    statcastCache.set(cacheKey, []);
    return [];
  }
}

async function fetchHitterStatcast(mlbamId, season) {
  if (!mlbamId) return null;
  const cacheKey = `hitter_${mlbamId}_${season}`;
  if (statcastCache.has(cacheKey)) return statcastCache.get(cacheKey);

  try {
    // Use filtered query: only batted ball types (BBT) to greatly reduce response size
    // This returns ~400-600 rows instead of ~3000+ (all pitches)
    // hfGT=R%7C filters to Regular Season only (excludes Spring Training)
    const bbtFilter = "fly%5C.%5C.ball%7Cground%5C.%5C.ball%7Cline%5C.%5C.drive%7Cpopup%7C";
    const url = `https://baseballsavant.mlb.com/statcast_search/csv?type=details&player_type=batter&player_id=${mlbamId}&hfSea=${season}%7C&hfGT=R%7C&hfBBT=${bbtFilter}&min_pitches=0&min_results=0`;
    console.log(`[statcast-hitter] Fetching batted balls for ID ${mlbamId} (${season})...`);
    const text = await fetchStatcastCSV(url);
    if(!text){
      console.warn(`[statcast-hitter] No data returned for ID ${mlbamId} (${season})`);
      statcastCache.set(cacheKey, []);
      return [];
    }
    const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
    const data = (parsed.data || []).filter(r => r["launch_speed"] || r["hc_x"]); // filter junk rows
    console.log(`[statcast-hitter] Got ${data.length} batted balls for ID ${mlbamId} (${season})`);
    statcastCache.set(cacheKey, data);
    return data;
  } catch(e) {
    console.warn("Statcast hitter fetch failed:", e);
    statcastCache.set(cacheKey, []);
    return [];
  }
}

// ── PITCH TYPE HELPERS ───────────────────────────────────────────────────
function pitchTypeColor(pt) {
  const colors = {
    "FF":"#B91C1C", "SI":"#92400E", "FC":"#7C3AED", "SL":"#047857",
    "CU":"#C2410C", "CH":"#1D4ED8", "FS":"#1abc9c", "KC":"#e74c3c",
    "SV":"#8e44ad", "ST":"#8e44ad", "KN":"#95a5a6"
  };
  return colors[pt] || "#6b88aa";
}

function pitchTypeName(pt) {
  const names = {
    "FF":"4-Seam", "SI":"Sinker", "FC":"Cutter", "SL":"Slider",
    "CU":"Curveball", "CH":"Changeup", "FS":"Splitter", "KC":"Knuckle Curve",
    "SV":"Sweeper", "ST":"Sweeper", "KN":"Knuckleball"
  };
  return names[pt] || pt;
}

function hitTypeColor(ht) {
  const colors = {
    "line_drive":"#047857", "fly_ball":"#C2410C",
    "ground_ball":"#1D4ED8", "popup":"#B91C1C"
  };
  return colors[ht] || "#6b88aa";
}

// ── PLAYER CARD MODAL CONTROL ───────────────────────────────────────────
// Cache for MLBAM ID lookups so we only search once per player name
const _mlbamLookupCache = {};

// Look up a player's MLBAM ID from MLB Stats API by name
// statsapi.mlb.com supports CORS natively — try direct fetch first, proxy as fallback
async function lookupMLBAMId(playerName){
  if(!playerName) return null;
  if(_mlbamLookupCache[playerName] !== undefined) return _mlbamLookupCache[playerName];

  const url = "https://statsapi.mlb.com/api/v1/people/search?names=" + encodeURIComponent(playerName) + "&sportIds=1&activeStatus=ACTIVE&hydrate=currentTeam";

  // Helper to parse MLB API response
  function parseMLBResponse(j){
    const people = j.people || [];
    if(people.length > 0){
      const exact = people.find(p => normName(p.fullName||"") === normName(playerName));
      const id = (exact || people[0]).id;
      _mlbamLookupCache[playerName] = id;
      console.log(`[mlbam-lookup] Found ${playerName} → ${id}`);
      return id;
    }
    return null;
  }

  // Attempt 1: Direct fetch (MLB Stats API supports CORS — usually fast)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 4000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if(resp.ok){
      const j = await resp.json();
      const id = parseMLBResponse(j);
      if(id) return id;
    }
  } catch(e){
    console.warn(`[mlbam-lookup] Direct fetch failed for ${playerName}, trying proxy:`, e.message);
  }

  // Attempt 2: Through CORS proxy as fallback
  try {
    const resp = await proxyFetch(url);
    const text = await resp.text();
    // Guard against proxy returning HTML error pages instead of JSON
    if(text.trim().startsWith("<") || !text.trim().startsWith("{")){
      console.warn(`[mlbam-lookup] Proxy returned non-JSON for ${playerName}`);
    } else {
      const j = JSON.parse(text);
      const id = parseMLBResponse(j);
      if(id) return id;
    }
  } catch(e){
    console.warn(`[mlbam-lookup] Proxy fetch also failed for ${playerName}:`, e.message);
  }

  _mlbamLookupCache[playerName] = null;
  return null;
}

// Determine which season to use for player card Statcast data
// Uses 2026 if we're past MLB Opening Day 2026 (~March 27) and data exists, otherwise 2025
function getCardSeason(){
  const now = new Date();
  const openingDay2026 = new Date(2026, 2, 27); // March 27, 2026
  // If we're past opening day and SEASON is set to 2026 (meaning user selected 2026 tab), use 2026
  if(now >= openingDay2026 && SEASON === 2026) return 2026;
  // If SEASON is explicitly set to 2026 by user (even before opening day), try 2026
  if(SEASON === 2026) return 2026;
  // Default to 2025 for player card data
  return 2025;
}

async function openPlayerCard(player, mode) {
  const season = getCardSeason();
  const overlay = document.getElementById("pc-overlay");
  const content = document.getElementById("pc-overlay-content");

  console.log(`[card] Opening ${mode} card for ${player.name}, mlbam_id=${player.mlbam_id}, season=${season}, fields=${Object.keys(player).length}, woba=${player.woba}, avg=${player.avg}`);

  const t0 = performance.now();
  content.innerHTML = '<div class="pc-loading"><div class="pc-loading-spinner"></div><div id="pc-load-msg">Loading player data...</div></div>';
  overlay.classList.add("visible");
  const setMsg = msg => { const el=document.getElementById("pc-load-msg"); if(el) el.textContent=msg; };

  // If no MLBAM ID, try to look it up on-the-fly via MLB Stats API
  if(!player.mlbam_id && player.name){
    setMsg("Looking up player ID...");
    const foundId = await lookupMLBAMId(player.name);
    if(foundId) player.mlbam_id = foundId;
  }

  // PARALLEL FETCH: kick off MLB API stats + Statcast data simultaneously
  // Previously these were SERIAL, which was the main bottleneck for non-seed players
  const needsApiStats = player.war == null && player.avg == null && player.era == null;
  const mlbamId = player.mlbam_id;

  // Start both fetches concurrently
  const apiStatsPromise = (mlbamId && needsApiStats)
    ? (setMsg("Fetching stats & Statcast data..."), fetchMLBApiStats(player, mode, season))
    : Promise.resolve();

  // Pre-fetch Statcast data in parallel (cache it so renderXxxCard picks it up instantly)
  const statcastPromise = mlbamId
    ? (mode === "hitters"
        ? fetchHitterStatcast(mlbamId, season)
        : fetchPitcherStatcast(mlbamId, season))
    : Promise.resolve(null);

  // Wait for both to complete
  await Promise.all([apiStatsPromise, statcastPromise]);

  setMsg("Rendering card...");
  console.log(`[card] Data fetched in ${((performance.now()-t0)/1000).toFixed(1)}s, rendering...`);

  if (mode === "hitters") {
    await renderHitterCard(player, season);
  } else {
    await renderPitcherCard(player, season);
  }
  console.log(`[card] Card fully rendered in ${((performance.now()-t0)/1000).toFixed(1)}s`);
}

// Fetch basic season stats from MLB Stats API for a player without FG data
async function fetchMLBApiStats(player, mode, season){
  try {
    const group = mode === "hitters" ? "hitting" : "pitching";
    const url = `https://statsapi.mlb.com/api/v1/people/${player.mlbam_id}?hydrate=stats(group=[${group}],type=[season],season=${season})`;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 6000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if(!resp.ok) return;
    const j = await resp.json();
    const person = (j.people || [])[0];
    if(!person) return;

    // Get season stats
    const statGroup = (person.stats || []).find(s => s.group && s.group.displayName === (mode === "hitters" ? "hitting" : "pitching"));
    const splits = statGroup ? statGroup.splits || [] : [];
    const seasonSplit = splits.find(s => s.season === String(season));
    if(!seasonSplit || !seasonSplit.stat) return;
    const s = seasonSplit.stat;

    if(mode === "hitters"){
      if(s.avg != null && player.avg == null) player.avg = parseFloat(s.avg);
      if(s.obp != null && player.obp == null) player.obp = parseFloat(s.obp);
      if(s.slg != null && player.slg == null) player.slg = parseFloat(s.slg);
      if(s.ops != null && player.ops == null) player.ops = parseFloat(s.ops);
      if(s.homeRuns != null && player.hr == null) player.hr = s.homeRuns;
      if(s.rbi != null && player.rbi == null) player.rbi = s.rbi;
      if(s.stolenBases != null && player.sb == null) player.sb = s.stolenBases;
      if(s.atBats != null && player.ab == null) player.ab = s.atBats;
      if(s.plateAppearances != null && player.pa == null) player.pa = s.plateAppearances;
      // Compute K% and BB% from counting stats
      if(s.strikeOuts != null && s.plateAppearances > 0 && player.k_pct == null)
        player.k_pct = (s.strikeOuts / s.plateAppearances * 100);
      if(s.baseOnBalls != null && s.plateAppearances > 0 && player.bb_pct == null)
        player.bb_pct = (s.baseOnBalls / s.plateAppearances * 100);
      // Compute wOBA from counting stats: wOBA = (0.69*BB + 0.72*HBP + 0.89*1B + 1.27*2B + 1.62*3B + 2.10*HR) / (AB + BB + SF + HBP)
      if(player.woba == null && s.atBats != null){
        const bb = s.baseOnBalls || 0, hbp = s.hitByPitch || 0;
        const doubles = s.doubles || 0, triples = s.triples || 0, hr = s.homeRuns || 0;
        const singles = (s.hits||0) - doubles - triples - hr;
        const sf = s.sacFlies || 0;
        const denom = s.atBats + bb + sf + hbp;
        if(denom > 0){
          player.woba = (0.69*bb + 0.72*hbp + 0.89*singles + 1.27*doubles + 1.62*triples + 2.10*hr) / denom;
        }
      }
      // Compute ISO if missing
      if(player.iso == null && s.slg != null && s.avg != null)
        player.iso = parseFloat(s.slg) - parseFloat(s.avg);
      // Compute BABIP if missing
      if(player.babip == null && s.atBats != null){
        const h = s.hits || 0, hr = s.homeRuns || 0, ab = s.atBats, k = s.strikeOuts || 0, sf = s.sacFlies || 0;
        const denom = ab - k - hr + sf;
        if(denom > 0) player.babip = (h - hr) / denom;
      }
      console.log(`[mlb-api] Loaded hitting stats for ${player.name}: .${s.avg}/${s.obp}/${s.slg}, wOBA=${player.woba!=null?player.woba.toFixed(3):"N/A"}`);
    } else {
      if(s.era != null && player.era == null) player.era = parseFloat(s.era);
      if(s.whip != null && player.whip == null) player.whip = parseFloat(s.whip);
      if(s.inningsPitched != null && player.ip == null) player.ip = parseFloat(s.inningsPitched);
      if(s.gamesPlayed != null && player.g == null) player.g = s.gamesPlayed;
      if(s.gamesStarted != null && player.gs == null) player.gs = s.gamesStarted;
      if(s.wins != null) player.w = s.wins;
      if(s.losses != null) player.l = s.losses;
      // K% and BB%
      if(s.strikeOuts != null && s.battersFaced > 0 && player.k_pct == null)
        player.k_pct = (s.strikeOuts / s.battersFaced * 100);
      if(s.baseOnBalls != null && s.battersFaced > 0 && player.bb_pct == null)
        player.bb_pct = (s.baseOnBalls / s.battersFaced * 100);
      // Role
      if(!player.role && s.gamesPlayed > 0)
        player.role = (s.gamesStarted / s.gamesPlayed) >= 0.5 ? "SP" : "RP";
      // Compute FIP if missing: FIP = ((13*HR + 3*(BB+HBP) - 2*K) / IP) + 3.2
      if(player.fip == null && s.inningsPitched != null){
        const ip = parseFloat(s.inningsPitched), hr = s.homeRuns || 0;
        const k = s.strikeOuts || 0, bb = s.baseOnBalls || 0, hbp = s.hitByPitch || 0;
        if(ip > 0) player.fip = ((13*hr + 3*(bb+hbp) - 2*k) / ip) + 3.2;
      }
      console.log(`[mlb-api] Loaded pitching stats for ${player.name}: ${s.era} ERA, ${s.inningsPitched} IP, FIP=${player.fip!=null?player.fip.toFixed(2):"N/A"}`);
    }
  } catch(e){
    console.warn(`[mlb-api] Stats fetch failed for ${player.name}:`, e.message);
  }
}

function closePcOverlay() {
  const overlay = document.getElementById("pc-overlay");
  overlay.classList.remove("visible");
}

// Close on background click
document.addEventListener("click", (e) => {
  const overlay = document.getElementById("pc-overlay");
  if (e.target === overlay) closePcOverlay();
});
// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePcOverlay();
});

// ── PLAYER SEARCH ────────────────────────────────────────────────────────
let _searchTimeout = null;
const _searchInput = () => document.getElementById("player-search");
const _searchDrop  = () => document.getElementById("ps-dropdown");
let _searchResults = [];
let _searchIdx = -1;

function debounceSearch(){
  clearTimeout(_searchTimeout);
  const q = _searchInput().value.trim();
  if(q.length < 2){ _searchDrop().classList.remove("visible"); _searchResults=[]; return; }
  _searchTimeout = setTimeout(()=>runPlayerSearch(q), 300);
}

async function runPlayerSearch(query){
  try {
    const url = "https://statsapi.mlb.com/api/v1/people/search?names=" + encodeURIComponent(query) + "&sportIds=1&activeStatus=ACTIVE&hydrate=currentTeam";
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 6000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if(!resp.ok) return;
    const j = await resp.json();
    const people = (j.people || []).slice(0, 8);
    _searchResults = people;
    _searchIdx = -1;
    renderSearchResults(people);
  } catch(e){
    console.warn("[search] Failed:", e.message);
    // Fallback: try through proxy
    try {
      const url = "https://statsapi.mlb.com/api/v1/people/search?names=" + encodeURIComponent(query) + "&sportIds=1&activeStatus=ACTIVE&hydrate=currentTeam";
      const resp = await proxyFetch(url);
      const text = await resp.text();
      if(text.trim().startsWith("<")) return;
      const j = JSON.parse(text);
      const people = (j.people || []).slice(0, 8);
      _searchResults = people;
      _searchIdx = -1;
      renderSearchResults(people);
    } catch(e2){
      console.warn("[search] Proxy fallback also failed:", e2.message);
    }
  }
}

function renderSearchResults(people){
  const drop = _searchDrop();
  if(!people.length){
    drop.innerHTML = '<div class="ps-empty">No active players found</div>';
    drop.classList.add("visible");
    return;
  }
  let html = "";
  people.forEach((p, i) => {
    const pos = p.primaryPosition ? p.primaryPosition.abbreviation : "--";
    const team = p.currentTeam ? p.currentTeam.abbreviation : "--";
    const isPitcher = pos === "P" || pos === "SP" || pos === "RP" || pos === "TWP";
    const initials = (p.fullName||"?").split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
    const typeClass = isPitcher ? "ps-type-p" : "ps-type-h";
    const typeLabel = isPitcher ? "Pitcher" : "Hitter";
    html += `<div class="ps-item" data-idx="${i}" onclick="selectSearchResult(${i})">
      <div class="ps-avatar">${initials}</div>
      <div>
        <div class="ps-name">${p.fullName || "--"}</div>
        <div class="ps-meta">${team} · ${pos} · Age ${p.currentAge || "--"}</div>
      </div>
      <span class="ps-type ${typeClass}">${typeLabel}</span>
    </div>`;
  });
  drop.innerHTML = html;
  drop.classList.add("visible");
}

function selectSearchResult(idx){
  const p = _searchResults[idx];
  if(!p) return;
  // Close dropdown
  _searchDrop().classList.remove("visible");
  _searchInput().value = "";

  const pos = p.primaryPosition ? p.primaryPosition.abbreviation : "";
  const posCode = p.primaryPosition ? p.primaryPosition.code : "";
  const isPitcher = pos === "P" || pos === "SP" || pos === "RP" || pos === "TWP" || posCode === "1";
  const team = p.currentTeam ? p.currentTeam.abbreviation : "--";
  const mlbamId = p.id;

  // First, try to find this player in the already-loaded DB data (has full FG stats)
  const searchName = normName(p.fullName || "");
  let existingPlayer = null;

  // Search in both season DBs
  for(const szn of [2025, 2026]){
    const dbEntry = DB[szn];
    if(!dbEntry) continue;
    if(!isPitcher && dbEntry.hitters){
      existingPlayer = dbEntry.hitters.find(h => normName(h.name||"") === searchName);
    }
    if(isPitcher && dbEntry.pitchers){
      existingPlayer = dbEntry.pitchers.find(pt => normName(pt.name||"") === searchName);
    }
    if(existingPlayer) break;
  }
  // Also try seed data directly
  if(!existingPlayer && !isPitcher){
    existingPlayer = SEED_H25.find(h => normName(h.name||"") === searchName);
  }
  if(!existingPlayer && isPitcher){
    existingPlayer = SEED_P25.find(pt => normName(pt.name||"") === searchName);
  }
  // If not found by type, try the other pool (e.g. Ohtani might be in hitters but searched as pitcher)
  if(!existingPlayer){
    existingPlayer = SEED_H25.find(h => normName(h.name||"") === searchName)
                  || SEED_P25.find(pt => normName(pt.name||"") === searchName)
                  || (DB[2026].hitters||[]).find(h => normName(h.name||"") === searchName)
                  || (DB[2026].pitchers||[]).find(pt => normName(pt.name||"") === searchName);
  }

  let playerObj;
  if(existingPlayer){
    // Use the full player object — merge in the MLBAM ID if it's missing
    playerObj = {...existingPlayer};
    if(!playerObj.mlbam_id) playerObj.mlbam_id = mlbamId;
    console.log(`[search] Found ${p.fullName} in loaded data with ${Object.keys(playerObj).length} fields`);
  } else {
    // Build a minimal player object — charts will still populate from Statcast
    playerObj = {
      name: p.fullName,
      team: team,
      age: p.currentAge,
      pos: pos,
      mlbam_id: mlbamId,
      fg_id: null,
    };
    console.log(`[search] ${p.fullName} not in loaded data, using search-only card`);
  }

  const mode = isPitcher ? "pitchers" : "hitters";
  openPlayerCard(playerObj, mode).catch(e=>console.error("Card error:", e));
}

// Keyboard navigation for search
document.addEventListener("keydown", (e) => {
  const drop = _searchDrop();
  if(!drop.classList.contains("visible")) return;
  const items = drop.querySelectorAll(".ps-item");
  if(!items.length) return;

  if(e.key === "ArrowDown"){
    e.preventDefault();
    _searchIdx = Math.min(_searchIdx + 1, items.length - 1);
    items.forEach((it,i) => it.classList.toggle("ps-active", i === _searchIdx));
    items[_searchIdx].scrollIntoView({block:"nearest"});
  } else if(e.key === "ArrowUp"){
    e.preventDefault();
    _searchIdx = Math.max(_searchIdx - 1, 0);
    items.forEach((it,i) => it.classList.toggle("ps-active", i === _searchIdx));
    items[_searchIdx].scrollIntoView({block:"nearest"});
  } else if(e.key === "Enter" && _searchIdx >= 0){
    e.preventDefault();
    selectSearchResult(_searchIdx);
  }
});

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  const wrap = document.querySelector(".player-search-wrap");
  if(wrap && !wrap.contains(e.target)){
    _searchDrop().classList.remove("visible");
  }
});

// ── PITCHER CARD RENDERING ──────────────────────────────────────────────
async function renderPitcherCard(player, season) {
  const content = document.getElementById("pc-overlay-content");
  const initials = (player.name || "?").split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
  
  let html = `<div class="pc-header">
    <div class="pc-header-top">
      <div class="pc-avatar">${initials}</div>
      <div class="pc-info">
        <div class="pc-name">${player.name || ""}</div>
        <div class="pc-meta">
          <span class="pc-team-badge">${player.team || "--"}</span>
          <span>${player.role || "P"} · Age ${player.age || "--"}</span>
          <span style="color:var(--fg2)">${season} Season</span>
        </div>
      </div>
    </div>
    <div class="pc-stats-row">
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.era)}</div><div class="pc-stat-lbl">ERA</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.fip)}</div><div class="pc-stat-lbl">FIP</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${player.k_pct!=null?(player.k_pct.toFixed(1)+"%"):"--"}</div><div class="pc-stat-lbl">K%</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.war)}</div><div class="pc-stat-lbl">WAR</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.velo)}</div><div class="pc-stat-lbl">FB Velo</div></div>
    </div>
  </div>`;

  if (!player.mlbam_id) {
    html += `<div style="padding:30px;background:var(--panel)">
      <div class="pc-error">No Statcast ID available for detailed pitch-level data.</div>
      ${renderPitcherStatSummary(player)}
    </div>`;
    content.innerHTML = html;
    return;
  }

  const pitchData = await fetchPitcherStatcast(player.mlbam_id, season);

  if (!pitchData || !pitchData.length) {
    html += `<div style="padding:30px;background:var(--panel)">
      <div class="pc-error">Statcast pitch data unavailable (CORS proxy timeout or no data for ${season}). Charts require Statcast access.</div>
      ${renderPitcherStatSummary(player)}
    </div>`;
    content.innerHTML = html;
    return;
  }

  // Derive FB velo from Statcast data if not already set
  if(player.velo == null && pitchData.length > 0){
    const fbPitches = pitchData.filter(r => r["pitch_type"] === "FF" || r["pitch_type"] === "SI");
    if(fbPitches.length > 0){
      let sumV=0, nV=0;
      fbPitches.forEach(r => { const v = parseFloat(r["release_speed"]); if(!isNaN(v)){ sumV+=v; nV++; } });
      if(nV>0) player.velo = sumV/nV;
    }
  }

  // Re-render header with potentially updated velo/stats
  const headerHtml = `<div class="pc-header">
    <div class="pc-header-top">
      <div class="pc-avatar">${initials}</div>
      <div class="pc-info">
        <div class="pc-name">${player.name || ""}</div>
        <div class="pc-meta">
          <span class="pc-team-badge">${player.team || "--"}</span>
          <span>${player.role || "P"} · Age ${player.age || "--"}</span>
          <span style="color:var(--fg2)">${season} Season</span>
        </div>
      </div>
    </div>
    <div class="pc-stats-row">
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.era)}</div><div class="pc-stat-lbl">ERA</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.fip)}</div><div class="pc-stat-lbl">FIP</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${player.k_pct!=null?(player.k_pct.toFixed(1)+"%"):"--"}</div><div class="pc-stat-lbl">K%</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.war)}</div><div class="pc-stat-lbl">WAR</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.velo)}</div><div class="pc-stat-lbl">FB Velo</div></div>
    </div>
  </div>`;
  html = headerHtml;

  html += `<div class="pc-body">
    <div class="pc-row pc-row-2col">
      <div class="chart-panel">
        <div class="cp-title">Pitch Movement<span class="cp-src cp-src-sv">Savant</span></div>
        <div class="chart-area" id="pc-movement"></div>
      </div>
      <div class="chart-panel">
        <div class="cp-title">Release Point<span class="cp-src cp-src-sv">Savant</span></div>
        <div class="chart-area" id="pc-release"></div>
      </div>
    </div>
    <div class="pc-row pc-row-2col">
      <div class="chart-panel">
        <div class="cp-title">Pitch Location<span class="cp-src cp-src-sv">Savant</span></div>
        <div class="chart-area" id="pc-location-wrap"></div>
      </div>
      <div class="stat-section">
        <div class="cp-title">Pitch Arsenal<span class="cp-src cp-src-sv">Savant</span></div>
        <div id="pc-arsenal"></div>
      </div>
    </div>
    ${renderPitcherStatSummary(player)}
    ${rollingChartHTML("pitcher", PITCHER_ROLLING_METRICS, "whiff_pct")}
  </div>`;

  content.innerHTML = html;

  // Render the actual charts
  renderPitcherMovement(pitchData);
  renderPitcherRelease(pitchData);
  renderPitcherLocation(pitchData);
  renderPitcherArsenal(pitchData, player);

  // Initialize rolling performance chart
  const pitcherDaily = computePitcherDailyStats(pitchData);
  initRollingChart("pitcher-rc-wrap", pitcherDaily, PITCHER_ROLLING_METRICS, computePitcherMetric, "whiff_pct");
}

function renderPitcherStatSummary(player) {
  return `<div class="pc-bottom-tbl">
    <div class="section-lbl">vs. League Average</div>
    <table class="vs-avg-tbl">
      <thead><tr><th>Metric</th><th>Value</th><th>MLB Avg</th><th>vs Avg</th><th>Metric</th><th>Value</th><th>MLB Avg</th><th>vs Avg</th></tr></thead>
      <tbody>
        <tr>
          <td>ERA</td><td>${fv(player.era)}</td><td>4.17</td><td class="${(player.era!=null&&player.era<4.17)?"diff-good":"diff-bad"}">${(player.era!=null?(player.era<4.17?"-":"+")+Math.abs(4.17-player.era).toFixed(2):"--")}</td>
          <td>K%</td><td>${player.k_pct!=null?player.k_pct.toFixed(1)+"%":"--"}</td><td>22.1%</td><td class="${(player.k_pct!=null&&player.k_pct>22.1)?"diff-good":"diff-bad"}">${(player.k_pct!=null?(player.k_pct>22.1?"+":"")+( player.k_pct-22.1).toFixed(1):"--")}</td>
        </tr>
        <tr>
          <td>FIP</td><td>${fv(player.fip)}</td><td>4.08</td><td class="${(player.fip!=null&&player.fip<4.08)?"diff-good":"diff-bad"}">${(player.fip!=null?(player.fip<4.08?"-":"+")+Math.abs(4.08-player.fip).toFixed(2):"--")}</td>
          <td>BB%</td><td>${player.bb_pct!=null?player.bb_pct.toFixed(1)+"%":"--"}</td><td>8.2%</td><td class="${(player.bb_pct!=null&&player.bb_pct<8.2)?"diff-good":"diff-bad"}">${(player.bb_pct!=null?(player.bb_pct<8.2?"-":"+")+Math.abs(8.2-player.bb_pct).toFixed(1):"--")}</td>
        </tr>
        <tr>
          <td>WHIP</td><td>${fv(player.whip)}</td><td>1.30</td><td class="${(player.whip!=null&&player.whip<1.30)?"diff-good":"diff-bad"}">${(player.whip!=null?(player.whip<1.30?"-":"+")+Math.abs(1.30-player.whip).toFixed(2):"--")}</td>
          <td>GB%</td><td>${player.gb_pct!=null?player.gb_pct.toFixed(1)+"%":"--"}</td><td>42.8%</td><td class="${(player.gb_pct!=null&&Math.abs(player.gb_pct-42.8)<1)?"diff-mid":player.gb_pct>42.8?"diff-good":"diff-bad"}">${(player.gb_pct!=null?(player.gb_pct>42.8?"+":"")+( player.gb_pct-42.8).toFixed(1):"--")}</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

function renderPitcherMovement(data) {
  const container = document.getElementById("pc-movement");
  if (!container) return;

  // Detect handedness from Savant p_throws field
  let rhpCount = 0, lhpCount = 0;
  data.forEach(row => {
    const pt = (row["p_throws"] || "").toUpperCase();
    if(pt === "R") rhpCount++;
    else if(pt === "L") lhpCount++;
  });
  const isRHP = rhpCount >= lhpCount;
  const handLabel = isRHP ? "RHP" : "LHP";

  // Savant pfx_x / pfx_z are in FEET — convert to INCHES (* 12) for standard movement chart
  // FLIP pfx_x to pitcher's perspective: negate so arm-side break is positive for the pitcher
  // Savant pfx_x: positive = movement to catcher's right; for RHP that's glove-side
  // After negation: positive = movement to pitcher's arm side (natural run direction for FB)
  const toIn = v => parseFloat(v) * 12;

  // Group by pitch type, compute averages in INCHES (pitcher's perspective)
  const byType = {};
  data.forEach(row => {
    const pt = row["pitch_type"] || "UN";
    if (!byType[pt]) byType[pt] = {vals:[], sumHB:0, sumVB:0, n:0};
    const hbRaw = toIn(row["pfx_x"]);
    const hb = -hbRaw;  // negate to flip from catcher's to pitcher's perspective
    const vb = toIn(row["pfx_z"]);
    if(!isNaN(hb) && !isNaN(vb)){ byType[pt].vals.push({hb,vb}); byType[pt].sumHB+=hb; byType[pt].sumVB+=vb; byType[pt].n++; }
  });

  // Compute cluster averages and standard deviations
  Object.keys(byType).forEach(pt => {
    const g = byType[pt];
    if(g.n>0){
      g.avgHB = g.sumHB/g.n;
      g.avgVB = g.sumVB/g.n;
      let ssH=0, ssV=0;
      g.vals.forEach(v => { ssH+=(v.hb-g.avgHB)**2; ssV+=(v.vb-g.avgVB)**2; });
      g.sdHB = Math.sqrt(ssH/g.n);
      g.sdVB = Math.sqrt(ssV/g.n);
    }
  });

  const RANGE = 25; // ±25 inches
  const px = v => 50 + (v + RANGE) / (2*RANGE) * 300;
  const py = v => 10 + (RANGE - v) / (2*RANGE) * 250; // higher IVB = higher on chart

  let svg = '<svg viewBox="0 0 400 300" style="width:100%;height:100%">';
  svg += '<rect x="50" y="10" width="300" height="250" fill="rgba(0,0,0,.02)" rx="4"/>';
  // Zero lines
  svg += `<line x1="${px(0)}" y1="10" x2="${px(0)}" y2="260" stroke="rgba(0,0,0,.1)" stroke-dasharray="4 3"/>`;
  svg += `<line x1="50" y1="${py(0)}" x2="350" y2="${py(0)}" stroke="rgba(0,0,0,.1)" stroke-dasharray="4 3"/>`;

  // Axes — pitcher's perspective with arm-side / glove-side labels
  const armSideLabel = isRHP ? "ARM SIDE →" : "← ARM SIDE";
  const gloveSideLabel = isRHP ? "← GLOVE SIDE" : "GLOVE SIDE →";
  svg += `<text x="200" y="285" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">${gloveSideLabel}   HB (in.)   ${armSideLabel}</text>`;
  svg += '<text transform="rotate(-90)" x="-135" y="16" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">INDUCED VERT. BREAK (in.)</text>';

  // Handedness badge
  svg += `<text x="345" y="24" text-anchor="end" fill="rgba(45,36,24,.35)" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="2">${handLabel}</text>`;

  // Ticks
  for(const tick of [-20,-10,0,10,20]){
    svg += `<text x="${px(tick)}" y="275" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">${tick}</text>`;
    if(tick!==0) svg += `<line x1="${px(tick)}" y1="10" x2="${px(tick)}" y2="260" stroke="rgba(0,0,0,.06)"/>`;
    svg += `<text x="44" y="${py(tick)+3}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">${tick}</text>`;
    if(tick!==0) svg += `<line x1="50" y1="${py(tick)}" x2="350" y2="${py(tick)}" stroke="rgba(0,0,0,.06)"/>`;
  }

  // Arm angle from fastball movement vector direction
  let armAngleDeg = null;
  const fbType = byType["FF"] || byType["SI"];
  if(fbType && fbType.n > 0){
    // atan2(IVB, HB) gives the movement axis angle from horizontal
    const rawDeg = Math.atan2(fbType.avgVB, fbType.avgHB) * 180 / Math.PI;
    armAngleDeg = Math.round(rawDeg);
    const rad = rawDeg * Math.PI / 180;
    const lineLen = 22;
    svg += `<line x1="${px(-lineLen*Math.cos(rad))}" y1="${py(-lineLen*Math.sin(rad))}" x2="${px(lineLen*Math.cos(rad))}" y2="${py(lineLen*Math.sin(rad))}" stroke="#92400E" stroke-width="1.5" stroke-dasharray="6 3" opacity=".35"/>`;
    const displayAngle = armAngleDeg >= 0 ? armAngleDeg : armAngleDeg + 180;
    svg += `<text x="${px(lineLen*0.8*Math.cos(rad))+6}" y="${py(lineLen*0.8*Math.sin(rad))-4}" fill="#92400E" font-family="Barlow Condensed" font-size="9" letter-spacing="1" opacity=".7">${displayAngle}°</text>`;
  }

  // Individual pitch dots (small, transparent)
  Object.keys(byType).forEach(pt => {
    const color = pitchTypeColor(pt);
    byType[pt].vals.forEach(v => {
      svg += `<circle cx="${px(v.hb)}" cy="${py(v.vb)}" r="2" fill="${color}" opacity=".2"/>`;
    });
  });

  // Cluster ellipses + average dots on top
  const sortedPt = Object.keys(byType).sort((a,b) => byType[a].n - byType[b].n); // draw smallest last (on top)
  sortedPt.forEach(pt => {
    const g = byType[pt];
    if(g.n < 3) return;
    const color = pitchTypeColor(pt);
    const cx = px(g.avgHB), cy = py(g.avgVB);
    const rx = Math.max(g.sdHB / (2*RANGE) * 300, 5);
    const ry = Math.max(g.sdVB / (2*RANGE) * 250, 5);
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-width="1.5" opacity=".6"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="${color}" stroke="rgba(0,0,0,.5)" stroke-width="1.2"/>`;
    svg += `<text x="${cx+9}" y="${cy+4}" fill="${color}" font-family="Barlow Condensed" font-size="10" font-weight="700">${pitchTypeName(pt).substring(0,3)}</text>`;
  });

  svg += '</svg>';

  let legend = '<div class="legend">';
  Object.keys(byType).sort((a,b)=>byType[b].n-byType[a].n).forEach(pt => {
    if(byType[pt].n<3) return;
    legend += `<div class="legend-item"><span class="pitch-dot" style="background:${pitchTypeColor(pt)}"></span>${pitchTypeName(pt)}</div>`;
  });
  if(armAngleDeg !== null) legend += '<div class="legend-item" style="color:#92400E">- - Arm Axis</div>';
  legend += `<div class="legend-item" style="color:rgba(45,36,24,.4)">${handLabel} · Pitcher's perspective</div>`;
  legend += '</div>';

  container.innerHTML = svg + legend;
}

function renderPitcherRelease(data) {
  const container = document.getElementById("pc-release");
  if (!container) return;

  // Detect handedness from Savant p_throws field
  let rhpCount = 0, lhpCount = 0;
  data.forEach(row => {
    const pt = (row["p_throws"] || "").toUpperCase();
    if(pt === "R") rhpCount++;
    else if(pt === "L") lhpCount++;
  });
  const isRHP = rhpCount >= lhpCount;
  const handLabel = isRHP ? "RHP" : "LHP";

  // Group by pitch type, compute average release point per type
  const byType = {};
  data.forEach(row => {
    const pt = row["pitch_type"] || "UN";
    if(!byType[pt]) byType[pt] = {sumX:0, sumZ:0, n:0};
    const rx = parseFloat(row["release_pos_x"]), rz = parseFloat(row["release_pos_z"]);
    if(!isNaN(rx) && !isNaN(rz)){ byType[pt].sumX+=rx; byType[pt].sumZ+=rz; byType[pt].n++; }
  });
  Object.keys(byType).forEach(pt => {
    const g = byType[pt];
    if(g.n>0){ g.avgX = g.sumX/g.n; g.avgZ = g.sumZ/g.n; }
  });

  // Overall average release point (used to estimate shoulder position)
  let allSumX=0, allSumZ=0, allN=0;
  Object.values(byType).forEach(g => { if(g.n>0){ allSumX+=g.sumX; allSumZ+=g.sumZ; allN+=g.n; }});
  const avgX = allN>0 ? allSumX/allN : 0;
  const avgZ = allN>0 ? allSumZ/allN : 5.5;

  // Shoulder estimated at ~40% of horizontal distance toward center, ~0.5ft above avg release
  const shoulderRealX = avgX * 0.4;
  const shoulderRealZ = avgZ + 0.5;

  // Shift all release coordinates relative to shoulder, then FLIP to pitcher's perspective:
  //   Savant release_pos_x is catcher's view: negative for RHP, positive for LHP
  //   Negate relX → pitcher's perspective: RHP extends to the right, LHP to the left
  //   Negate relZ → release below shoulder appears ABOVE origin (arm extending outward)
  // Result: RHP dots land in upper-right quadrant, LHP in upper-left
  // Exception: low-slot pitchers (e.g. Tyler Rogers) will have dots far to the side, low on Y
  const sortedTypes = Object.keys(byType).sort((a,b) => byType[b].n - byType[a].n);
  const validTypes = sortedTypes.filter(pt => byType[pt].n >= 2);

  validTypes.forEach(pt => {
    const g = byType[pt];
    const rawRelX = g.avgX - shoulderRealX;
    const rawRelZ = g.avgZ - shoulderRealZ;
    // Flip to pitcher's perspective
    g.plotX = -rawRelX;  // negate: catcher's left → pitcher's right for RHP
    g.plotZ = -rawRelZ;  // negate: below shoulder → above origin
    // Arm angle from vertical: 0° = straight overhead, 90° = sidearm
    g.armAngle = Math.round(Math.atan2(Math.abs(g.plotX), Math.abs(g.plotZ)) * 180 / Math.PI);
  });

  // Dynamic zoom: find extent of all flipped release points, ensure (0,0) shoulder is visible
  let minPX = 0, maxPX = 0, minPZ = 0, maxPZ = 0;
  validTypes.forEach(pt => {
    const g = byType[pt];
    minPX = Math.min(minPX, g.plotX); maxPX = Math.max(maxPX, g.plotX);
    minPZ = Math.min(minPZ, g.plotZ); maxPZ = Math.max(maxPZ, g.plotZ);
  });
  // Add padding — ensure shoulder (0,0) sits at bottom with room
  const padH = Math.max(0.3, (maxPX - minPX) * 0.35);
  const padV = Math.max(0.3, (maxPZ - minPZ) * 0.35);
  const xMin = minPX - padH, xMax = maxPX + padH;
  const zMin = Math.min(minPZ, -0.1) - padV * 0.5;  // keep shoulder near bottom
  const zMax = maxPZ + padV;

  // Coordinate transforms: plot area 50→350 horizontal, 10→260 vertical
  const rpx = v => 50 + (v - xMin) / (xMax - xMin) * 300;
  const rpy = v => 260 - (v - zMin) / (zMax - zMin) * 250;

  let svg = '<svg viewBox="0 0 400 300" style="width:100%;height:100%">';
  svg += '<rect x="50" y="10" width="300" height="250" fill="rgba(0,0,0,.02)" rx="4"/>';

  // Axis labels — pitcher's perspective
  const xAxisLabel = isRHP ? "← GLOVE SIDE          ARM SIDE →" : "← ARM SIDE          GLOVE SIDE →";
  svg += `<text x="200" y="290" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">${xAxisLabel}</text>`;
  svg += '<text transform="rotate(-90)" x="-135" y="16" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">ARM EXTENSION (ft)</text>';

  // Tick marks along axes
  const xTicks = 5, zTicks = 4;
  for(let i=0; i<=xTicks; i++){
    const val = xMin + (xMax-xMin)*i/xTicks;
    const px = rpx(val);
    svg += `<text x="${px}" y="275" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">${val.toFixed(1)}</text>`;
    svg += `<line x1="${px}" y1="260" x2="${px}" y2="263" stroke="#6b88aa" stroke-width=".5"/>`;
  }
  for(let i=0; i<=zTicks; i++){
    const val = zMin + (zMax-zMin)*i/zTicks;
    const py = rpy(val);
    svg += `<text x="44" y="${py+3}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">${val.toFixed(1)}</text>`;
    svg += `<line x1="47" y1="${py}" x2="50" y2="${py}" stroke="#6b88aa" stroke-width=".5"/>`;
  }

  // Shoulder marker at (0,0) — sits near the bottom of the chart
  const shX = rpx(0), shY = rpy(0);

  // Light crosshair at shoulder
  if(0 >= xMin && 0 <= xMax) {
    svg += `<line x1="${shX}" y1="10" x2="${shX}" y2="260" stroke="rgba(0,0,0,.08)" stroke-width="1" stroke-dasharray="4 4"/>`;
  }
  if(0 >= zMin && 0 <= zMax) {
    svg += `<line x1="50" y1="${shY}" x2="350" y2="${shY}" stroke="rgba(0,0,0,.08)" stroke-width="1" stroke-dasharray="4 4"/>`;
  }

  // Shoulder dot and label
  svg += `<circle cx="${shX}" cy="${shY}" r="6" fill="rgba(0,0,0,.06)" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>`;
  svg += `<text x="${shX}" y="${shY+14}" text-anchor="middle" fill="rgba(45,36,24,.45)" font-family="Barlow Condensed" font-size="9" letter-spacing="1">SHOULDER</text>`;

  // Handedness badge in top corner
  const badgeX = isRHP ? 340 : 60;
  const badgeAnchor = isRHP ? "end" : "start";
  svg += `<text x="${badgeX}" y="24" text-anchor="${badgeAnchor}" fill="rgba(45,36,24,.35)" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="2">${handLabel}</text>`;

  // Per-pitch-type: dotted arm angle line from shoulder (0,0) to release point + dot
  validTypes.forEach(pt => {
    const g = byType[pt];
    const color = pitchTypeColor(pt);
    const cx = rpx(g.plotX), cy = rpy(g.plotZ);

    // Dotted line from shoulder to pitch type release coordinate
    svg += `<line x1="${shX}" y1="${shY}" x2="${cx}" y2="${cy}" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 3" opacity=".55"/>`;

    // Pitch type dot
    const r = Math.max(8, Math.min(14, 6 + g.n / 40));
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="rgba(0,0,0,.4)" stroke-width="1.5" opacity=".9"/>`;
    svg += `<text x="${cx}" y="${cy+3.5}" text-anchor="middle" fill="rgba(0,0,0,.8)" font-family="Barlow Condensed" font-size="${Math.max(8,r-2)}" font-weight="700">${pt}</text>`;

    // Arm angle label — place on the outward side of the dot
    const labelOffX = g.plotX >= 0 ? r+4 : -(r+4);
    const anchor = g.plotX >= 0 ? "start" : "end";
    svg += `<text x="${cx+labelOffX}" y="${cy+3}" text-anchor="${anchor}" fill="${color}" font-family="Barlow Condensed" font-size="9" opacity=".8">${g.armAngle}°</text>`;
  });

  svg += '</svg>';

  // Legend
  let legend = '<div class="legend">';
  validTypes.forEach(pt => {
    const g = byType[pt];
    legend += `<div class="legend-item"><span class="pitch-dot" style="background:${pitchTypeColor(pt)}"></span>${pitchTypeName(pt)} (${g.armAngle}°)</div>`;
  });
  legend += `<div class="legend-item" style="color:rgba(45,36,24,.4)">${handLabel} · Pitcher's perspective · Angle from vertical</div>`;
  legend += '</div>';

  container.innerHTML = svg + legend;
}

// Store pitch data globally so filter changes can re-render without re-fetching
let _locData = null;

function renderPitcherLocation(data) {
  const container = document.getElementById("pc-location-wrap");
  if (!container) return;
  _locData = data;

  // Build pitch type options from data
  const ptSet = new Set();
  data.forEach(r => { if(r["pitch_type"]) ptSet.add(r["pitch_type"]); });
  const pitchTypes = [...ptSet].sort();

  // Filter controls
  let ctrl = '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;align-items:center">';
  ctrl += '<select id="loc-pitch-filter" style="background:var(--ink);color:var(--fg);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-family:var(--fh);font-size:10px">';
  ctrl += '<option value="ALL">All Pitches</option>';
  pitchTypes.forEach(pt => { ctrl += `<option value="${pt}">${pitchTypeName(pt)}</option>`; });
  ctrl += '</select>';
  ctrl += '<select id="loc-metric-filter" style="background:var(--ink);color:var(--fg);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-family:var(--fh);font-size:10px">';
  ctrl += '<option value="density">Density</option>';
  ctrl += '<option value="whiff">Whiff%</option>';
  ctrl += '<option value="hardhit">Hard Hit%</option>';
  ctrl += '</select>';
  ctrl += '</div>';
  ctrl += '<div id="loc-heatmap-svg"></div>';

  container.innerHTML = ctrl;

  // Attach filter listeners
  document.getElementById("loc-pitch-filter").addEventListener("change", () => _drawLocHeatmap());
  document.getElementById("loc-metric-filter").addEventListener("change", () => _drawLocHeatmap());

  _drawLocHeatmap();
}

function _drawLocHeatmap() {
  const svgContainer = document.getElementById("loc-heatmap-svg");
  if(!svgContainer || !_locData) return;

  const ptFilter = document.getElementById("loc-pitch-filter").value;
  const metric = document.getElementById("loc-metric-filter").value;

  // Filter data by pitch type
  let filtered = _locData;
  if(ptFilter !== "ALL") filtered = _locData.filter(r => r["pitch_type"] === ptFilter);

  // Grid: 10 columns x 12 rows covering plate_x: -1.5→1.5, plate_z: 0.5→4.5
  const COLS=10, ROWS=12;
  const xMin=-1.5, xMax=1.5, zMin=0.5, zMax=4.5;
  const cellW=(xMax-xMin)/COLS, cellH=(zMax-zMin)/ROWS;

  // Build grid cells
  const grid = Array.from({length:ROWS}, ()=>Array.from({length:COLS}, ()=>({total:0, whiffs:0, hardHits:0, swings:0})));

  filtered.forEach(row => {
    const x = parseFloat(row["plate_x"]), z = parseFloat(row["plate_z"]);
    if(isNaN(x)||isNaN(z)) return;
    const col = Math.floor((x - xMin) / cellW);
    const rowIdx = Math.floor((z - zMin) / cellH);
    if(col<0||col>=COLS||rowIdx<0||rowIdx>=ROWS) return;
    const cell = grid[rowIdx][col];
    cell.total++;
    const desc = (row["description"]||"").toLowerCase();
    const isSwing = desc.includes("swinging_strike") || desc.includes("foul") || desc.includes("hit_into_play");
    if(isSwing) cell.swings++;
    if(desc.includes("swinging_strike")) cell.whiffs++;
    const ev = parseFloat(row["launch_speed"]);
    if(!isNaN(ev) && ev >= 95) cell.hardHits++;
  });

  // Compute metric values and find max for color scaling
  let maxVal = 0;
  const values = [];
  for(let r=0;r<ROWS;r++){
    values[r] = [];
    for(let c=0;c<COLS;c++){
      const cell = grid[r][c];
      let val = 0;
      if(metric === "density") val = cell.total;
      else if(metric === "whiff") val = cell.swings > 5 ? (cell.whiffs / cell.swings * 100) : 0;
      else if(metric === "hardhit") val = cell.total > 3 ? (cell.hardHits / cell.total * 100) : 0;
      values[r][c] = val;
      if(val > maxVal) maxVal = val;
    }
  }

  // Color function
  const heatColor = (val) => {
    if(maxVal === 0 || val === 0) return "rgba(0,0,0,.02)";
    const t = Math.min(val / maxVal, 1);
    if(metric === "density"){
      // Blue → Red gradient
      const r = Math.round(40 + 200 * t);
      const g = Math.round(40 + 80 * (1 - t));
      const b = Math.round(200 * (1 - t) + 50);
      return `rgba(${r},${g},${b},${0.15 + t * 0.7})`;
    } else if(metric === "whiff"){
      // Low=blue, High=red (whiff is good for pitcher)
      const r = Math.round(60 + 180 * t);
      const g = Math.round(60 * (1 - t));
      const b = Math.round(200 * (1 - t));
      return `rgba(${r},${g},${b},${0.2 + t * 0.7})`;
    } else {
      // Hard hit: low=green(good for pitcher), high=red(bad)
      const r = Math.round(40 + 200 * t);
      const g = Math.round(200 * (1 - t) + 40);
      const b = Math.round(40);
      return `rgba(${r},${g},${b},${0.2 + t * 0.7})`;
    }
  };

  // SVG dimensions
  const svgL=70, svgR=350, svgT=15, svgB=255;
  const pxW=(svgR-svgL)/COLS, pxH=(svgB-svgT)/ROWS;
  const toPx = (x) => svgL + (x - xMin) / (xMax - xMin) * (svgR - svgL);
  const toPy = (z) => svgB - (z - zMin) / (zMax - zMin) * (svgB - svgT);

  let svg = '<svg viewBox="0 0 400 290" style="width:100%;height:100%">';

  // Draw heatmap cells
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const x1 = svgL + c * pxW, y1 = svgB - (r+1) * pxH;
      svg += `<rect x="${x1}" y="${y1}" width="${pxW+0.5}" height="${pxH+0.5}" fill="${heatColor(values[r][c])}" rx="1"/>`;
      // Show value in cell if significant
      if(values[r][c] > 0 && metric !== "density" && grid[r][c].total > 5){
        svg += `<text x="${x1+pxW/2}" y="${y1+pxH/2+3}" text-anchor="middle" fill="rgba(45,36,24,.7)" font-family="JetBrains Mono" font-size="7">${Math.round(values[r][c])}</text>`;
      }
    }
  }

  // Strike zone outline (plate_x: -0.83 to 0.83, plate_z: ~1.5 to ~3.5)
  const szL=toPx(-0.83), szR=toPx(0.83), szT=toPy(3.5), szB=toPy(1.5);
  svg += `<rect x="${szL}" y="${szT}" width="${szR-szL}" height="${szB-szT}" fill="none" stroke="rgba(45,36,24,.35)" stroke-width="1.5" rx="2"/>`;
  // Zone grid (3x3 inside strike zone)
  const szW=(szR-szL)/3, szH=(szB-szT)/3;
  for(let i=1;i<3;i++){
    svg += `<line x1="${szL+i*szW}" y1="${szT}" x2="${szL+i*szW}" y2="${szB}" stroke="rgba(45,36,24,.12)"/>`;
    svg += `<line x1="${szL}" y1="${szT+i*szH}" x2="${szR}" y2="${szT+i*szH}" stroke="rgba(45,36,24,.12)"/>`;
  }

  // Axis labels
  svg += '<text x="210" y="280" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">PLATE X (ft)</text>';
  svg += `<text x="60" y="275" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">-1.5</text>`;
  svg += `<text x="210" y="275" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">0</text>`;
  svg += `<text x="355" y="275" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">1.5</text>`;
  svg += `<text x="62" y="${svgB+3}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">0.5</text>`;
  svg += `<text x="62" y="${(svgT+svgB)/2+3}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">2.5</text>`;
  svg += `<text x="62" y="${svgT+6}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">4.5</text>`;

  // Info text
  const nPitches = filtered.length;
  const metricLabel = {density:"Pitch Density", whiff:"Whiff Rate", hardhit:"Hard Hit Rate"}[metric];
  svg += `<text x="355" y="12" text-anchor="end" fill="var(--fg3)" font-family="Barlow Condensed" font-size="9">${nPitches} pitches · ${metricLabel}</text>`;

  svg += '</svg>';

  // Legend bar
  let legend = '<div class="legend" style="justify-content:space-between">';
  legend += `<span style="font-size:9px;color:var(--fg2)">Low</span>`;
  legend += `<div style="flex:1;height:6px;margin:0 8px;border-radius:3px;background:linear-gradient(to right, rgba(50,50,200,.3), rgba(200,50,50,.8))"></div>`;
  legend += `<span style="font-size:9px;color:var(--fg2)">High</span>`;
  legend += '</div>';

  svgContainer.innerHTML = svg + legend;
}

function renderPitcherArsenal(data, player) {
  const container = document.getElementById("pc-arsenal");
  if (!container) return;
  
  // Group by pitch type
  const byType = {};
  data.forEach(row => {
    const pt = row["pitch_type"] || "UN";
    if (!byType[pt]) byType[pt] = [];
    byType[pt].push(row);
  });
  
  // Calculate usage
  const total = data.length;
  const types = Object.keys(byType).sort((a, b) => byType[b].length - byType[a].length);
  
  let html = '<div style="margin-bottom:14px">';
  html += '<div style="font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:2px;color:var(--fg2);text-transform:uppercase;margin-bottom:6px">Usage</div>';
  html += '<div style="display:flex;flex-direction:column;gap:5px">';
  
  types.forEach(pt => {
    const count = byType[pt].length;
    const pct = (count / total * 100).toFixed(1);
    const color = pitchTypeColor(pt);
    html += `<div class="freq-bar-wrap"><span class="pitch-dot" style="background:${color}"></span><span style="font-family:var(--fh);font-size:10px;color:var(--fg2);width:80px">${pitchTypeName(pt)}</span><div class="freq-bar" style="width:${pct}%;background:${color}"></div><span class="freq-pct">${pct}%</span></div>`;
  });
  
  html += '</div></div>';
  
  // Stats table
  html += '<div><div style="font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:2px;color:var(--fg2);text-transform:uppercase;margin-bottom:4px">Results by Pitch</div>';
  html += '<table class="stat-tbl"><thead><tr><th>Pitch</th><th>Count</th><th>Avg Velo</th><th>Whiff%</th></tr></thead><tbody>';
  
  types.forEach(pt => {
    const pitches = byType[pt];
    const count = pitches.length;
    const velo = pitches.reduce((sum, p) => {
      const v = parseFloat(p["release_speed"]);
      return sum + (v != null ? v : 0);
    }, 0) / count;
    
    let whiff = 0;
    pitches.forEach(p => {
      const desc = (p["description"] || "").toLowerCase();
      if (desc.includes("swinging_strike")) whiff++;
    });
    const whiffPct = (whiff / count * 100).toFixed(1);
    
    html += `<tr><td class="pitch-name"><span class="pitch-dot" style="background:${pitchTypeColor(pt)}"></span>${pitchTypeName(pt)}</td><td>${count}</td><td>${velo.toFixed(1)}</td><td>${whiffPct}%</td></tr>`;
  });
  
  html += '</tbody></table></div>';
  
  container.innerHTML = html;
}

// ── ROLLING PERFORMANCE CHART (Option D) ────────────────────────────────
// Shared logic for both hitter and pitcher rolling charts

const HITTER_ROLLING_METRICS = [
  {key:"avg", label:"AVG", fmt:v=>v.toFixed(3), mlbAvg:.258, higher:true},
  {key:"woba", label:"wOBA", fmt:v=>v.toFixed(3), mlbAvg:.319, higher:true},
  {key:"slg", label:"SLG", fmt:v=>v.toFixed(3), mlbAvg:.402, higher:true},
  {key:"iso", label:"ISO", fmt:v=>v.toFixed(3), mlbAvg:.144, higher:true},
  {key:"babip", label:"BABIP", fmt:v=>v.toFixed(3), mlbAvg:.298, higher:true},
  {key:"barrel_pct", label:"Barrel%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.068, higher:true},
  {key:"hard_hit_pct", label:"Hard Hit%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.368, higher:true},
  {key:"avg_ev", label:"Avg EV", fmt:v=>v.toFixed(1), mlbAvg:88.5, higher:true},
  {key:"avg_la", label:"Avg LA", fmt:v=>v.toFixed(1), mlbAvg:12.0, higher:null},
];

const PITCHER_ROLLING_METRICS = [
  {key:"whiff_pct", label:"Whiff%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.245, higher:true},
  {key:"k_pct", label:"K%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.221, higher:true},
  {key:"bb_pct", label:"BB%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.082, higher:false},
  {key:"avg_ev_against", label:"Avg EV ag.", fmt:v=>v.toFixed(1), mlbAvg:88.5, higher:false},
  {key:"barrel_pct_against", label:"Barrel% ag.", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.068, higher:false},
  {key:"avg_velo", label:"Avg Velo", fmt:v=>v.toFixed(1), mlbAvg:93.5, higher:true},
  {key:"chase_pct", label:"Chase%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.285, higher:true},
  {key:"zone_pct", label:"Zone%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.45, higher:null},
  {key:"csw_pct", label:"CSW%", fmt:v=>(v*100).toFixed(1)+"%", mlbAvg:.29, higher:true},
];

// Group Statcast rows by game_date and compute daily aggregates
function computeHitterDailyStats(data) {
  const byDate = {};
  data.forEach(row => {
    const d = row["game_date"];
    if(!d) return;
    if(!byDate[d]) byDate[d] = {date:d, hits:0, abs:0, h1b:0, h2b:0, h3b:0, hr:0, bb:0, hbp:0, sf:0, pa:0,
      ev_sum:0, ev_n:0, la_sum:0, la_n:0, barrels:0, hard_hits:0, bbe:0, woba_sum:0, woba_n:0};
    const g = byDate[d];

    const ev = parseFloat(row["launch_speed"]);
    const la = parseFloat(row["launch_angle"]);
    const event = (row["events"]||"").toLowerCase();
    const xwoba = parseFloat(row["estimated_woba_using_speedangle"]);
    const isBarrel = (row["barrel"]||"") === "1" || parseInt(row["launch_speed_angle"]) === 6;

    g.bbe++;
    if(!isNaN(ev)) { g.ev_sum += ev; g.ev_n++; if(ev >= 95) g.hard_hits++; }
    if(!isNaN(la)) { g.la_sum += la; g.la_n++; }
    if(isBarrel) g.barrels++;
    if(!isNaN(xwoba)) { g.woba_sum += xwoba; g.woba_n++; }

    // Approximate PA/AB from batted ball events
    if(event) {
      g.pa++;
      const isHit = ["single","double","triple","home_run"].includes(event);
      const isBB = event === "walk";
      const isHBP = event === "hit_by_pitch";
      const isSF = event === "sac_fly";
      if(isHit) g.hits++;
      if(!isBB && !isHBP && !isSF) g.abs++;
      if(event === "single") g.h1b++;
      if(event === "double") g.h2b++;
      if(event === "triple") g.h3b++;
      if(event === "home_run") g.hr++;
      if(isBB) g.bb++;
      if(isHBP) g.hbp++;
      if(isSF) g.sf++;
    }
  });
  return Object.values(byDate).sort((a,b) => a.date.localeCompare(b.date));
}

function computePitcherDailyStats(data) {
  const byDate = {};
  data.forEach(row => {
    const d = row["game_date"];
    if(!d) return;
    if(!byDate[d]) byDate[d] = {date:d, pitches:0, swings:0, whiffs:0, strikes:0, balls:0,
      called_strikes:0, k:0, bb:0, bf:0, ev_sum:0, ev_n:0, barrels:0, bbe:0,
      velo_sum:0, velo_n:0, chase_swings:0, out_of_zone:0, csw:0};
    const g = byDate[d];

    g.pitches++;
    const desc = (row["description"]||"").toLowerCase();
    const type = (row["type"]||"").toUpperCase();
    const event = (row["events"]||"").toLowerCase();
    const zone = parseInt(row["zone"]);
    const inZone = zone >= 1 && zone <= 9;

    const isSwing = desc.includes("swing") || desc.includes("foul") || desc.includes("hit_into_play") || desc.includes("bunt");
    const isWhiff = desc.includes("swinging_strike") || desc === "missed_bunt" || desc.includes("foul_tip");
    const isCalledStrike = desc === "called_strike";

    if(isSwing) g.swings++;
    if(isWhiff) g.whiffs++;
    if(isCalledStrike) g.called_strikes++;
    if(isCalledStrike || isWhiff) g.csw++;
    if(!inZone && isSwing) g.chase_swings++;
    if(!inZone) g.out_of_zone++;

    const ev = parseFloat(row["launch_speed"]);
    if(!isNaN(ev)) { g.ev_sum += ev; g.ev_n++; g.bbe++; if(ev >= 95) g.barrels; }
    const isBarrel = (row["barrel"]||"") === "1" || parseInt(row["launch_speed_angle"]) === 6;
    if(isBarrel) g.barrels++;

    const velo = parseFloat(row["release_speed"]);
    if(!isNaN(velo)) { g.velo_sum += velo; g.velo_n++; }

    if(event === "strikeout" || event === "strikeout_double_play") g.k++;
    if(event === "walk") g.bb++;
    if(event) g.bf++;
  });
  return Object.values(byDate).sort((a,b) => a.date.localeCompare(b.date));
}

// Compute rolling metric value from a window of daily stat objects
function computeHitterMetric(days, metricKey) {
  let hits=0, abs=0, pa=0, h1b=0, h2b=0, h3b=0, hr=0, bb=0, hbp=0, sf=0;
  let ev_sum=0, ev_n=0, la_sum=0, la_n=0, barrels=0, hard_hits=0, bbe=0, woba_sum=0, woba_n=0;
  days.forEach(d => {
    hits+=d.hits; abs+=d.abs; pa+=d.pa;
    h1b+=d.h1b; h2b+=d.h2b; h3b+=d.h3b; hr+=d.hr; bb+=d.bb; hbp+=d.hbp; sf+=d.sf;
    ev_sum+=d.ev_sum; ev_n+=d.ev_n; la_sum+=d.la_sum; la_n+=d.la_n;
    barrels+=d.barrels; hard_hits+=d.hard_hits; bbe+=d.bbe; woba_sum+=d.woba_sum; woba_n+=d.woba_n;
  });
  switch(metricKey) {
    case "avg": return abs > 0 ? hits/abs : null;
    case "slg": return abs > 0 ? (h1b + 2*h2b + 3*h3b + 4*hr)/abs : null;
    case "iso": return abs > 0 ? (h2b + 2*h3b + 3*hr)/abs : null;
    case "babip": { const bip = abs - hr; return bip > 0 ? (hits - hr)/bip : null; }
    case "woba": return woba_n > 0 ? woba_sum/woba_n : null;
    case "barrel_pct": return bbe > 0 ? barrels/bbe : null;
    case "hard_hit_pct": return ev_n > 0 ? hard_hits/ev_n : null;
    case "avg_ev": return ev_n > 0 ? ev_sum/ev_n : null;
    case "avg_la": return la_n > 0 ? la_sum/la_n : null;
    default: return null;
  }
}

function computePitcherMetric(days, metricKey) {
  let pitches=0, swings=0, whiffs=0, k=0, bb=0, bf=0;
  let ev_sum=0, ev_n=0, barrels=0, bbe=0, velo_sum=0, velo_n=0;
  let chase_swings=0, out_of_zone=0, csw=0;
  days.forEach(d => {
    pitches+=d.pitches; swings+=d.swings; whiffs+=d.whiffs;
    k+=d.k; bb+=d.bb; bf+=d.bf;
    ev_sum+=d.ev_sum; ev_n+=d.ev_n; barrels+=d.barrels; bbe+=d.bbe;
    velo_sum+=d.velo_sum; velo_n+=d.velo_n;
    chase_swings+=d.chase_swings; out_of_zone+=d.out_of_zone; csw+=d.csw;
  });
  switch(metricKey) {
    case "whiff_pct": return swings > 0 ? whiffs/swings : null;
    case "k_pct": return bf > 0 ? k/bf : null;
    case "bb_pct": return bf > 0 ? bb/bf : null;
    case "avg_ev_against": return ev_n > 0 ? ev_sum/ev_n : null;
    case "barrel_pct_against": return bbe > 0 ? barrels/bbe : null;
    case "avg_velo": return velo_n > 0 ? velo_sum/velo_n : null;
    case "chase_pct": return out_of_zone > 0 ? chase_swings/out_of_zone : null;
    case "zone_pct": return pitches > 0 ? (pitches - out_of_zone)/pitches : null;
    case "csw_pct": return pitches > 0 ? csw/pitches : null;
    default: return null;
  }
}

// Build rolling time-series: 7-day rolling window, step per game date
function buildRollingSeries(dailyStats, metricKey, computeFn, windowDays=7) {
  if(!dailyStats.length) return [];
  const points = [];
  for(let i = 0; i < dailyStats.length; i++) {
    const endDate = new Date(dailyStats[i].date);
    const startDate = new Date(endDate); startDate.setDate(startDate.getDate() - windowDays + 1);
    const windowDaysList = dailyStats.filter(d => {
      const dd = new Date(d.date);
      return dd >= startDate && dd <= endDate;
    });
    const val = computeFn(windowDaysList, metricKey);
    if(val !== null) points.push({date: dailyStats[i].date, value: val});
  }
  return points;
}

// Split series into periods (monthly or weekly)
function splitIntoPeriods(series, splitBy) {
  if(!series.length) return [];
  const groups = {};
  series.forEach(pt => {
    const d = new Date(pt.date);
    let key;
    if(splitBy === "monthly") {
      key = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
    } else { // weekly
      // ISO week: Monday-based
      const dayOfWeek = (d.getDay() + 6) % 7; // Mon=0
      const monday = new Date(d);
      monday.setDate(d.getDate() - dayOfWeek);
      key = monday.toISOString().slice(0,10);
    }
    if(!groups[key]) groups[key] = {key, points:[], dates:[]};
    groups[key].points.push(pt);
    groups[key].dates.push(pt.date);
  });
  return Object.values(groups).sort((a,b) => a.key.localeCompare(b.key));
}

// Format period label
function periodLabel(key, splitBy) {
  if(splitBy === "monthly") {
    const [y,m] = key.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[parseInt(m)-1] + " " + y;
  } else {
    const d = new Date(key);
    const end = new Date(d); end.setDate(d.getDate() + 6);
    const fmt = dt => (dt.getMonth()+1) + "/" + dt.getDate();
    return fmt(d) + " – " + fmt(end);
  }
}

// Render the rolling chart SVG + period table (Option D)
function renderRollingChart(containerId, series, metric, splitBy, periods) {
  const container = document.getElementById(containerId);
  if(!container || !series.length) return;

  const W = 800, H = 170, PAD_L = 50, PAD_R = 20, PAD_T = 10, PAD_B = 30;
  const chartW = W - PAD_L - PAD_R, chartH = H - PAD_T - PAD_B;

  const vals = series.map(p => p.value);
  let vMin = Math.min(...vals), vMax = Math.max(...vals);
  const mlbAvg = metric.mlbAvg;
  // Expand range to include MLB avg
  if(mlbAvg != null) { vMin = Math.min(vMin, mlbAvg); vMax = Math.max(vMax, mlbAvg); }
  const vRange = (vMax - vMin) || 0.001;
  const margin = vRange * 0.15;
  vMin -= margin; vMax += margin;

  const px = (i) => PAD_L + (i / (series.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - vMin) / (vMax - vMin)) * chartH;

  // Color segments by period
  const periodColors = ["#C2410C","#047857","#1D4ED8","#B91C1C","#7C3AED","#92400E","#059669","#3B82F6"];
  const periodMap = {};
  periods.forEach((p, idx) => {
    p.dates.forEach(d => periodMap[d] = idx);
  });

  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block">`;

  // Axes
  svg += `<line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${PAD_T+chartH}" stroke="rgba(0,0,0,.06)"/>`;
  svg += `<line x1="${PAD_L}" y1="${PAD_T+chartH}" x2="${PAD_L+chartW}" y2="${PAD_T+chartH}" stroke="rgba(0,0,0,.06)"/>`;

  // Horizontal gridlines
  const nTicks = 4;
  for(let t = 0; t <= nTicks; t++) {
    const v = vMin + (t / nTicks) * (vMax - vMin);
    const yy = py(v);
    if(t > 0 && t < nTicks) svg += `<line x1="${PAD_L}" y1="${yy}" x2="${PAD_L+chartW}" y2="${yy}" stroke="rgba(0,0,0,.03)" stroke-dasharray="4 4"/>`;
    svg += `<text x="${PAD_L-6}" y="${yy+3}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">${metric.fmt(v)}</text>`;
  }

  // Period shading bands
  periods.forEach((p, idx) => {
    if(idx % 2 === 0) {
      const firstIdx = series.findIndex(s => p.dates.includes(s.date));
      const lastIdx = series.length - 1 - [...series].reverse().findIndex(s => p.dates.includes(s.date));
      if(firstIdx >= 0 && lastIdx >= 0) {
        const x1 = px(firstIdx), x2 = px(lastIdx);
        svg += `<rect x="${x1}" y="${PAD_T}" width="${Math.max(x2-x1,2)}" height="${chartH}" fill="rgba(0,0,0,.015)"/>`;
      }
    }
  });

  // Period labels at bottom
  periods.forEach((p, idx) => {
    const firstIdx = series.findIndex(s => p.dates.includes(s.date));
    const lastIdx = series.length - 1 - [...series].reverse().findIndex(s => p.dates.includes(s.date));
    if(firstIdx >= 0 && lastIdx >= 0) {
      const midX = (px(firstIdx) + px(lastIdx)) / 2;
      const lbl = splitBy === "monthly" ? periodLabel(p.key, splitBy).split(" ")[0].toUpperCase() : periodLabel(p.key, splitBy);
      svg += `<text x="${midX}" y="${H - 2}" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="${splitBy==="weekly"?7:9}">${lbl}</text>`;
    }
  });

  // MLB average reference line
  if(mlbAvg != null && mlbAvg >= vMin && mlbAvg <= vMax) {
    const yAvg = py(mlbAvg);
    svg += `<line x1="${PAD_L}" y1="${yAvg}" x2="${PAD_L+chartW}" y2="${yAvg}" stroke="rgba(29,78,216,.2)" stroke-width="1.5" stroke-dasharray="6 4"/>`;
    svg += `<text x="${PAD_L+chartW+4}" y="${yAvg+3}" fill="#1D4ED8" font-family="Barlow Condensed" font-size="8" opacity=".6">MLB</text>`;
  }

  // Draw color-coded line segments by period
  for(let i = 1; i < series.length; i++) {
    const pIdx = periodMap[series[i].date] ?? 0;
    const color = periodColors[pIdx % periodColors.length];
    svg += `<line x1="${px(i-1)}" y1="${py(series[i-1].value)}" x2="${px(i)}" y2="${py(series[i].value)}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  // Data dots at period transitions and endpoints
  if(series.length > 0) {
    const firstPIdx = periodMap[series[0].date] ?? 0;
    svg += `<circle cx="${px(0)}" cy="${py(series[0].value)}" r="3" fill="${periodColors[firstPIdx % periodColors.length]}" stroke="var(--panel)" stroke-width="1.5"/>`;
  }
  for(let i = 1; i < series.length; i++) {
    const prevP = periodMap[series[i-1].date] ?? 0;
    const currP = periodMap[series[i].date] ?? 0;
    if(currP !== prevP || i === series.length - 1) {
      const color = periodColors[currP % periodColors.length];
      svg += `<circle cx="${px(i)}" cy="${py(series[i].value)}" r="3" fill="${color}" stroke="var(--panel)" stroke-width="1.5"/>`;
    }
  }

  svg += '</svg>';

  // Period comparison table
  const seasonVal = vals.length > 0 ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  let tbl = `<div class="rc-tbl-wrap"><table class="rc-period-tbl">`;
  tbl += `<thead><tr><th>Period</th><th>${metric.label}</th><th>BBE/PA</th><th>vs Season</th><th>vs MLB Avg</th><th>Trend</th></tr></thead><tbody>`;

  periods.forEach((p, idx) => {
    const pVals = p.points.map(pt => pt.value);
    const pAvg = pVals.length > 0 ? pVals.reduce((a,b)=>a+b,0)/pVals.length : null;
    if(pAvg === null) return;
    const isLast = idx === periods.length - 1;
    const vsSeason = pAvg - seasonVal;
    const vsMLB = mlbAvg != null ? pAvg - mlbAvg : null;

    // Trend: compare last third to first third of period
    let trend = "→ Steady", trendClass = "color:var(--fg2)";
    if(pVals.length >= 3) {
      const third = Math.max(1, Math.floor(pVals.length / 3));
      const early = pVals.slice(0, third).reduce((a,b)=>a+b,0)/third;
      const late = pVals.slice(-third).reduce((a,b)=>a+b,0)/third;
      const diff = late - early;
      const threshold = Math.abs(seasonVal) * 0.03 || 0.005;
      const isHigherBetter = metric.higher;
      if(isHigherBetter === null) {
        trend = Math.abs(diff) < threshold ? "→ Steady" : (diff > 0 ? "↑ Rising" : "↓ Falling");
        trendClass = Math.abs(diff) < threshold ? "color:var(--fg2)" : "color:var(--gold)";
      } else if(Math.abs(diff) < threshold) {
        trend = "→ Steady"; trendClass = "color:var(--fg2)";
      } else if((diff > 0) === isHigherBetter) {
        const mag = Math.abs(diff) > threshold * 3 ? "Surging" : "Rising";
        trend = `↑ ${mag}`; trendClass = "color:var(--green)";
      } else {
        const mag = Math.abs(diff) > threshold * 3 ? "Slumping" : "Cooling";
        trend = `↓ ${mag}`; trendClass = "color:var(--red)";
      }
    }

    const fmtDiff = (d) => {
      if(d === null) return "--";
      // For percentage metrics (barrel_pct, etc), show as pct points
      const isAbs = ["avg_ev","avg_la","avg_ev_against","avg_velo"].includes(metric.key);
      const prefix = d > 0 ? "+" : "";
      if(isAbs) return prefix + d.toFixed(1);
      return prefix + d.toFixed(3);
    };

    const diffGood = (d) => {
      if(d === null || metric.higher === null) return "";
      return ((d > 0) === metric.higher) ? "color:var(--green)" : "color:var(--red)";
    };

    tbl += `<tr>
      <td class="${isLast?"rc-current":""}">${periodLabel(p.key, splitBy)}</td>
      <td style="font-weight:600${isLast?";color:var(--gold)":""}">${metric.fmt(pAvg)}</td>
      <td>${p.points.length}</td>
      <td style="${diffGood(vsSeason)}">${fmtDiff(vsSeason)}</td>
      <td style="${diffGood(vsMLB)}">${vsMLB !== null ? fmtDiff(vsMLB) : "--"}</td>
      <td style="${trendClass}">${trend}</td>
    </tr>`;
  });

  tbl += '</tbody></table></div>';

  container.innerHTML = `<div class="rc-chart-area">${svg}</div>${tbl}`;
}

// Initialize rolling chart controls + render
function initRollingChart(wrapperId, dailyStats, metrics, computeFn, defaultMetric) {
  const wrapper = document.getElementById(wrapperId);
  if(!wrapper || !dailyStats.length) {
    if(wrapper) wrapper.innerHTML = '<div style="padding:16px;color:var(--fg2);font-family:var(--fh);font-size:11px;letter-spacing:1px">Insufficient data for rolling chart</div>';
    return;
  }

  const metricSel = wrapper.querySelector(".rc-metric-sel");
  const splitSel = wrapper.querySelector(".rc-split-sel");
  const chartContainer = wrapper.querySelector(".rc-chart-container");

  function update() {
    const metricKey = metricSel.value;
    const splitBy = splitSel.value;
    const metric = metrics.find(m => m.key === metricKey) || metrics[0];
    const series = buildRollingSeries(dailyStats, metricKey, computeFn, 7);
    const periods = splitIntoPeriods(series, splitBy);
    renderRollingChart(chartContainer.id, series, metric, splitBy, periods);
  }

  metricSel.addEventListener("change", update);
  splitSel.addEventListener("change", update);
  update();
}

// Generate the rolling chart HTML section
function rollingChartHTML(idPrefix, metrics, defaultMetric) {
  const options = metrics.map(m => `<option value="${m.key}"${m.key===defaultMetric?" selected":""}>${m.label}</option>`).join("");
  return `<div class="rc-section">
    <div class="section-lbl">Rolling Performance</div>
    <div class="rc-wrap" id="${idPrefix}-rc-wrap">
      <div class="rc-controls">
        <span class="rc-label">Metric</span>
        <select class="rc-metric-sel">${options}</select>
        <span class="rc-label" style="margin-left:8px">Split by</span>
        <select class="rc-split-sel"><option value="monthly" selected>Monthly</option><option value="weekly">Weekly</option></select>
        <span style="flex:1"></span>
        <span class="rc-label" style="color:var(--fg2)">7-Day Rolling</span>
      </div>
      <div class="rc-chart-container" id="${idPrefix}-rc-chart"></div>
    </div>
  </div>`;
}

// ── HITTER CARD RENDERING ───────────────────────────────────────────────
async function renderHitterCard(player, season) {
  const content = document.getElementById("pc-overlay-content");
  const initials = (player.name || "?").split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
  
  let html = `<div class="pc-header">
    <div class="pc-header-top">
      <div class="pc-avatar">${initials}</div>
      <div class="pc-info">
        <div class="pc-name">${player.name || ""}</div>
        <div class="pc-meta">
          <span class="pc-team-badge">${player.team || "--"}</span>
          <span>${player.pos || "--"} · Age ${player.age || "--"}</span>
          <span style="color:var(--fg2)">${season} Season</span>
        </div>
      </div>
    </div>
    <div class="pc-stats-row">
      <div class="pc-stat"><div class="pc-stat-val">${player.avg!=null?player.avg.toFixed(3):"--"}</div><div class="pc-stat-lbl">AVG</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${player.ops!=null?player.ops.toFixed(3):"--"}</div><div class="pc-stat-lbl">OPS</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${player.wrc_plus!=null?Math.round(player.wrc_plus):"--"}</div><div class="pc-stat-lbl">wRC+</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${player.hr!=null?Math.round(player.hr):"--"}</div><div class="pc-stat-lbl">HR</div></div>
      <div class="pc-stat"><div class="pc-stat-val">${fv(player.war)}</div><div class="pc-stat-lbl">WAR</div></div>
    </div>
  </div>`;

  if (!player.mlbam_id) {
    html += `<div style="padding:30px;background:var(--panel)">
      <div class="pc-error">No Statcast ID available for detailed batted ball data.</div>
      ${renderHitterStatSummary(player)}
    </div>`;
    content.innerHTML = html;
    return;
  }

  const batData = await fetchHitterStatcast(player.mlbam_id, season);

  if (!batData || !batData.length) {
    html += `<div style="padding:30px;background:var(--panel)">
      <div class="pc-error">Statcast batted ball data unavailable (CORS proxy timeout or no data for ${season}). Charts require Statcast access.</div>
      ${renderHitterStatSummary(player)}
    </div>`;
    content.innerHTML = html;
    return;
  }

  html += `<div class="pc-body">
    <div class="pc-row pc-row-2col">
      <div class="chart-panel">
        <div class="cp-title">Spray Chart<span class="cp-src cp-src-sv">Savant</span></div>
        <div class="chart-area" id="pc-spray"></div>
      </div>
      <div class="stat-section">
        <div class="cp-title">Batted Ball Profile<span class="cp-src cp-src-sv">Savant</span></div>
        <div id="pc-bbprofile"></div>
      </div>
    </div>
    <div class="pc-row pc-row-2col">
      <div class="chart-panel">
        <div class="cp-title">Zone Contact Heatmap<span class="cp-src cp-src-sv">Savant</span></div>
        <div class="chart-area" id="pc-zoneheat"></div>
      </div>
      <div class="chart-panel">
        <div class="cp-title">EV vs Launch Angle<span class="cp-src cp-src-sv">Savant</span></div>
        <div class="chart-area" id="pc-evla"></div>
      </div>
    </div>
    ${renderHitterStatSummary(player)}
    ${rollingChartHTML("hitter", HITTER_ROLLING_METRICS, "woba")}
  </div>`;

  content.innerHTML = html;

  // Render the actual charts
  renderHitterSpray(batData);
  renderHitterEvLA(batData);
  renderHitterZoneHeat(batData);
  renderHitterBBProfile(batData, player);

  // Initialize rolling performance chart
  const hitterDaily = computeHitterDailyStats(batData);
  initRollingChart("hitter-rc-wrap", hitterDaily, HITTER_ROLLING_METRICS, computeHitterMetric, "woba");
}

function renderHitterStatSummary(player) {
  return `<div class="pc-bottom-tbl">
    <div class="section-lbl">vs. League Average</div>
    <table class="vs-avg-tbl">
      <thead><tr><th>Metric</th><th>Value</th><th>MLB Avg</th><th>vs Avg</th><th>Metric</th><th>Value</th><th>MLB Avg</th><th>vs Avg</th></tr></thead>
      <tbody>
        <tr>
          <td>AVG</td><td>${player.avg!=null?player.avg.toFixed(3):"--"}</td><td>.258</td><td class="${(player.avg!=null&&player.avg>.258)?"diff-good":"diff-bad"}">${(player.avg!=null?(player.avg>.258?"+":"")+( player.avg-.258).toFixed(3):"--")}</td>
          <td>K%</td><td>${player.k_pct!=null?player.k_pct.toFixed(1)+"%":"--"}</td><td>23.1%</td><td class="${(player.k_pct!=null&&player.k_pct<23.1)?"diff-good":"diff-bad"}">${(player.k_pct!=null?(player.k_pct<23.1?"-":"+")+Math.abs(23.1-player.k_pct).toFixed(1):"--")}</td>
        </tr>
        <tr>
          <td>OBP</td><td>${player.obp!=null?player.obp.toFixed(3):"--"}</td><td>.323</td><td class="${(player.obp!=null&&player.obp>.323)?"diff-good":"diff-bad"}">${(player.obp!=null?(player.obp>.323?"+":"")+( player.obp-.323).toFixed(3):"--")}</td>
          <td>BB%</td><td>${player.bb_pct!=null?player.bb_pct.toFixed(1)+"%":"--"}</td><td>8.5%</td><td class="${(player.bb_pct!=null&&player.bb_pct>8.5)?"diff-good":"diff-bad"}">${(player.bb_pct!=null?(player.bb_pct>8.5?"+":"")+( player.bb_pct-8.5).toFixed(1):"--")}</td>
        </tr>
        <tr>
          <td>SLG</td><td>${player.slg!=null?player.slg.toFixed(3):"--"}</td><td>.402</td><td class="${(player.slg!=null&&player.slg>.402)?"diff-good":"diff-bad"}">${(player.slg!=null?(player.slg>.402?"+":"")+( player.slg-.402).toFixed(3):"--")}</td>
          <td>wOBA</td><td>${player.woba!=null?player.woba.toFixed(3):"--"}</td><td>.319</td><td class="${(player.woba!=null&&player.woba>.319)?"diff-good":"diff-bad"}">${(player.woba!=null?(player.woba>.319?"+":"")+( player.woba-.319).toFixed(3):"--")}</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

function renderHitterSpray(data) {
  const container = document.getElementById("pc-spray");
  if (!container) return;

  // ── Savant spray chart coordinate system ──
  // Home plate is at (125.42, 199) in Savant pixel coordinates
  // The Savant coordinate space: x increases left→right (catcher's view), y increases top→bottom
  // 1 Savant unit ≈ 2.5 feet (empirically calibrated so that ~160 Savant units ≈ 400 ft)
  const HP_X = 125.42, HP_Y = 199.0;
  const SCALE = 2.50; // feet per Savant unit

  // SVG layout: home plate at bottom center, field opens upward
  const SVG_W = 400, SVG_H = 340;
  const HP_SVG_X = SVG_W / 2, HP_SVG_Y = SVG_H - 30;
  const FT_TO_PX = 0.72; // SVG pixels per foot (tuned so 400ft fence ≈ 288px from HP)

  // Convert Savant hc_x/hc_y → SVG coordinates
  const hc_to_svg = (hc_x, hc_y) => {
    const dx_ft = (hc_x - HP_X) * SCALE;  // horizontal feet from HP (+ = right field from catcher)
    const dy_ft = (HP_Y - hc_y) * SCALE;  // distance toward outfield (Savant y decreases going out)
    const svgX = HP_SVG_X + dx_ft * FT_TO_PX;
    const svgY = HP_SVG_Y - dy_ft * FT_TO_PX;
    return [svgX, svgY];
  };

  let svg = `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" style="width:100%;height:100%">`;

  // ── Field geometry (from HP) ──
  // Foul lines at 45° from HP, fence arc at ~330-400 ft
  const fenceR = 370 * FT_TO_PX; // ~370 ft average fence distance
  const infieldR = 130 * FT_TO_PX; // infield dirt ~130 ft
  const baseDist = 90 * FT_TO_PX; // 90 ft between bases

  // Outfield grass fill (fan shape from HP to fence arc between foul lines)
  const flAngle = Math.PI / 4; // 45° foul lines
  const fLL_X = HP_SVG_X - fenceR * Math.sin(flAngle), fLL_Y = HP_SVG_Y - fenceR * Math.cos(flAngle);
  const fLR_X = HP_SVG_X + fenceR * Math.sin(flAngle), fLR_Y = HP_SVG_Y - fenceR * Math.cos(flAngle);
  // Outfield arc
  svg += `<path d="M${HP_SVG_X},${HP_SVG_Y} L${fLL_X},${fLL_Y} A${fenceR},${fenceR} 0 0,1 ${fLR_X},${fLR_Y} Z" fill="rgba(4,120,87,.04)" stroke="rgba(45,36,24,.08)" stroke-width="0.5"/>`;

  // Infield dirt arc
  const iLL_X = HP_SVG_X - infieldR * Math.sin(flAngle), iLL_Y = HP_SVG_Y - infieldR * Math.cos(flAngle);
  const iLR_X = HP_SVG_X + infieldR * Math.sin(flAngle), iLR_Y = HP_SVG_Y - infieldR * Math.cos(flAngle);
  svg += `<path d="M${HP_SVG_X},${HP_SVG_Y} L${iLL_X},${iLL_Y} A${infieldR},${infieldR} 0 0,1 ${iLR_X},${iLR_Y} Z" fill="rgba(180,140,80,.06)" stroke="none"/>`;

  // Fence arc (dashed)
  svg += `<path d="M${fLL_X},${fLL_Y} A${fenceR},${fenceR} 0 0,1 ${fLR_X},${fLR_Y}" fill="none" stroke="rgba(45,36,24,.15)" stroke-width="1.5" stroke-dasharray="6 4"/>`;

  // Foul lines
  svg += `<line x1="${HP_SVG_X}" y1="${HP_SVG_Y}" x2="${fLL_X}" y2="${fLL_Y}" stroke="rgba(45,36,24,.12)" stroke-width="0.8"/>`;
  svg += `<line x1="${HP_SVG_X}" y1="${HP_SVG_Y}" x2="${fLR_X}" y2="${fLR_Y}" stroke="rgba(45,36,24,.12)" stroke-width="0.8"/>`;

  // Base diamond
  const b1x = HP_SVG_X + baseDist * Math.sin(flAngle) * 0.707;
  const b1y = HP_SVG_Y - baseDist * Math.cos(flAngle) * 0.707;
  const b2x = HP_SVG_X;
  const b2y = HP_SVG_Y - baseDist * Math.sqrt(2);
  const b3x = HP_SVG_X - baseDist * Math.sin(flAngle) * 0.707;
  const b3y = HP_SVG_Y - baseDist * Math.cos(flAngle) * 0.707;
  svg += `<path d="M${HP_SVG_X},${HP_SVG_Y} L${b1x},${b1y} L${b2x},${b2y} L${b3x},${b3y} Z" fill="none" stroke="rgba(45,36,24,.15)" stroke-width="1"/>`;

  // Home plate marker
  svg += `<rect x="${HP_SVG_X-4}" y="${HP_SVG_Y-2}" width="8" height="5" fill="rgba(45,36,24,.25)" rx="1"/>`;

  // Distance markers
  for(const ft of [200, 300, 400]){
    const r = ft * FT_TO_PX;
    const arcL_X = HP_SVG_X - r * Math.sin(flAngle) * 0.95;
    const arcL_Y = HP_SVG_Y - r * Math.cos(flAngle) * 0.95;
    const arcR_X = HP_SVG_X + r * Math.sin(flAngle) * 0.95;
    const arcR_Y = HP_SVG_Y - r * Math.cos(flAngle) * 0.95;
    svg += `<path d="M${arcL_X},${arcL_Y} A${r},${r} 0 0,1 ${arcR_X},${arcR_Y}" fill="none" stroke="rgba(45,36,24,.06)" stroke-width="0.5" stroke-dasharray="3 5"/>`;
    svg += `<text x="${HP_SVG_X}" y="${HP_SVG_Y - r + 10}" text-anchor="middle" fill="rgba(45,36,24,.12)" font-family="Barlow Condensed" font-size="8">${ft}ft</text>`;
  }

  // ── Plot batted balls ──
  const byType = {};
  data.forEach(row => {
    const bb = row["bb_type"] || "unknown";
    if (!byType[bb]) byType[bb] = [];
    byType[bb].push(row);
  });

  const bbColors = {"line_drive":"#047857","fly_ball":"#C2410C","ground_ball":"#1D4ED8","popup":"#B91C1C"};

  Object.keys(byType).forEach(bb => {
    const color = bbColors[bb] || "#6b88aa";
    byType[bb].forEach(row => {
      const hcx = parseFloat(row["hc_x"]), hcy = parseFloat(row["hc_y"]);
      if (!isNaN(hcx) && !isNaN(hcy)) {
        const [sx, sy] = hc_to_svg(hcx, hcy);
        if(sx > 0 && sx < SVG_W && sy > 0 && sy < SVG_H){
          svg += `<circle cx="${sx}" cy="${sy}" r="3.5" fill="${color}" opacity=".65"/>`;
        }
      }
    });
  });

  // HR markers on top
  data.forEach(row => {
    if((row["events"]||"").toLowerCase() === "home_run"){
      const hcx = parseFloat(row["hc_x"]), hcy = parseFloat(row["hc_y"]);
      if(!isNaN(hcx) && !isNaN(hcy)){
        const [sx, sy] = hc_to_svg(hcx, hcy);
        if(sx > 0 && sx < SVG_W && sy > 0 && sy < SVG_H){
          svg += `<circle cx="${sx}" cy="${sy}" r="5.5" fill="none" stroke="#92400E" stroke-width="1.5" opacity=".85"/>`;
        }
      }
    }
  });

  svg += '</svg>';

  let legend = '<div class="legend">';
  Object.keys(byType).forEach(bb => {
    const color = bbColors[bb] || "#6b88aa";
    const label = {"line_drive":"Line Drive","fly_ball":"Fly Ball","ground_ball":"Ground Ball","popup":"Popup"}[bb] || bb;
    legend += `<div class="legend-item"><span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;margin-right:4px"></span>${label}</div>`;
  });
  legend += '<div class="legend-item"><span style="width:8px;height:8px;border-radius:50%;border:1.5px solid #92400E;display:inline-block;margin-right:4px"></span>HR</div>';
  legend += '</div>';

  container.innerHTML = svg + legend;
}

function renderHitterEvLA(data) {
  const container = document.getElementById("pc-evla");
  if (!container) return;

  // ── Option B: Heatmap Grid with xBA values ──
  // Grid bins: LA columns × EV rows
  const laBins = [
    {min:-30, max:-10, label:"-30 to -10°"},
    {min:-10, max:5,   label:"-10 to 5°"},
    {min:5,   max:15,  label:"5 to 15°"},
    {min:15,  max:25,  label:"15 to 25°"},
    {min:25,  max:40,  label:"25 to 40°"},
    {min:40,  max:70,  label:"40 to 70°"}
  ];
  const evBins = [
    {min:60,  max:75,  label:"60-75"},
    {min:75,  max:85,  label:"75-85"},
    {min:85,  max:95,  label:"85-95"},
    {min:95,  max:105, label:"95-105"},
    {min:105, max:120, label:"105+"}
  ];

  // Aggregate: for each cell, compute xBA (hits / AB proxy) from Savant estimated_ba or events
  const grid = [];
  for(let r=0; r<evBins.length; r++){
    grid[r] = [];
    for(let c=0; c<laBins.length; c++){
      grid[r][c] = {count:0, hits:0, sumXba:0, nXba:0, barrels:0, hardHit:0};
    }
  }

  data.forEach(row => {
    const ev = parseFloat(row["launch_speed"]);
    const la = parseFloat(row["launch_angle"]);
    if(isNaN(ev) || isNaN(la)) return;
    let ri = -1, ci = -1;
    for(let r=0; r<evBins.length; r++){ if(ev >= evBins[r].min && ev < evBins[r].max){ ri=r; break; } }
    for(let c=0; c<laBins.length; c++){ if(la >= laBins[c].min && la < laBins[c].max){ ci=c; break; } }
    if(ev >= 105) ri = 4; // catch 105+ in top bin
    if(la >= 40) ci = 5;  // catch 40+ in last bin
    if(ri < 0 || ci < 0) return;
    const cell = grid[ri][ci];
    cell.count++;
    if(ev >= 98 && la >= 8 && la <= 32) cell.barrels++;
    if(ev >= 95) cell.hardHit++;

    // Use estimated_ba_using_speedangle if available, otherwise approximate from events
    const xba = parseFloat(row["estimated_ba_using_speedangle"]);
    if(!isNaN(xba)){ cell.sumXba += xba; cell.nXba++; }
    else {
      const evt = (row["events"] || "").toLowerCase();
      if(evt){
        const isHit = evt.includes("single") || evt.includes("double") || evt.includes("triple") || evt.includes("home_run");
        cell.hits += isHit ? 1 : 0;
      }
    }
  });

  // Compute xBA per cell
  grid.forEach(row => row.forEach(cell => {
    if(cell.nXba > 0) cell.xba = cell.sumXba / cell.nXba;
    else if(cell.count > 0) cell.xba = cell.hits / cell.count;
    else cell.xba = null;
  }));

  // SVG dimensions
  const PAD_L = 55, PAD_T = 15, PAD_B = 45, PAD_R = 10;
  const SVG_W = 400, SVG_H = 310;
  const COLS = laBins.length, ROWS = evBins.length;
  const cellW = (SVG_W - PAD_L - PAD_R) / COLS;
  const cellH = (SVG_H - PAD_T - PAD_B) / ROWS;

  // Color function: xBA → color
  const xbaColor = (xba, count) => {
    if(xba == null || count < 2) return "rgba(0,0,0,.03)";
    if(xba >= 0.700) return "rgba(185,28,28,.55)";   // elite
    if(xba >= 0.500) return "rgba(146,64,14,.45)";  // great
    if(xba >= 0.350) return "rgba(194,65,12,.3)";    // good
    if(xba >= 0.250) return "rgba(4,120,87,.2)";    // avg
    if(xba >= 0.150) return "rgba(29,78,216,.15)";   // below avg
    return "rgba(29,78,216,.07)";                     // weak
  };

  let svg = `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" style="width:100%;height:100%">`;

  // Draw grid cells (EV rows: bottom = low, top = high)
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      const cell = grid[r][c];
      const x = PAD_L + c * cellW;
      const y = PAD_T + (ROWS - 1 - r) * cellH; // flip so high EV is at top
      const fill = xbaColor(cell.xba, cell.count);
      svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="rgba(45,36,24,.06)" stroke-width=".5" rx="2"/>`;

      // Show xBA value if enough samples
      if(cell.count >= 3 && cell.xba != null){
        const textFill = cell.xba >= 0.400 ? "#2D2418" : "rgba(45,36,24,.65)";
        const fw = cell.xba >= 0.400 ? "700" : "400";
        svg += `<text x="${x+cellW/2}" y="${y+cellH/2+1}" text-anchor="middle" dominant-baseline="middle" fill="${textFill}" font-family="JetBrains Mono" font-size="10" font-weight="${fw}">${cell.xba.toFixed(3)}</text>`;
        // Sample count below
        svg += `<text x="${x+cellW/2}" y="${y+cellH/2+12}" text-anchor="middle" fill="rgba(45,36,24,.25)" font-family="Barlow Condensed" font-size="7">n=${cell.count}</text>`;
      } else if(cell.count > 0){
        svg += `<text x="${x+cellW/2}" y="${y+cellH/2+3}" text-anchor="middle" fill="rgba(45,36,24,.2)" font-family="Barlow Condensed" font-size="8">n=${cell.count}</text>`;
      }
    }
  }

  // Barrel zone outline (EV 95-120 × LA 5-40° → rows 3-4, cols 2-4)
  const bx = PAD_L + 2 * cellW, by = PAD_T + 0 * cellH;
  const bw = 3 * cellW, bh = 2 * cellH;
  svg += `<rect x="${bx-1}" y="${by-1}" width="${bw+2}" height="${bh+2}" fill="none" stroke="rgba(146,64,14,.4)" stroke-width="1.5" stroke-dasharray="5 3" rx="4"/>`;
  svg += `<text x="${bx+bw/2}" y="${by-5}" text-anchor="middle" fill="#92400E" font-family="Barlow Condensed" font-size="8" font-weight="700" letter-spacing="1.5" opacity=".8">BARREL ZONE</text>`;

  // Y-axis labels (EV bins)
  for(let r=0; r<ROWS; r++){
    const y = PAD_T + (ROWS - 1 - r) * cellH + cellH/2 + 3;
    svg += `<text x="${PAD_L-4}" y="${y}" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">${evBins[r].label}</text>`;
  }
  // X-axis labels (LA bins)
  for(let c=0; c<COLS; c++){
    const x = PAD_L + c * cellW + cellW/2;
    // Shorter labels
    const shortLabels = ["-30°", "-10°", "5°", "15°", "25°", "40°"];
    svg += `<text x="${x}" y="${PAD_T + ROWS*cellH + 14}" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="8">${shortLabels[c]}</text>`;
  }

  // Axis titles
  svg += `<text x="${PAD_L + (SVG_W-PAD_L-PAD_R)/2}" y="${SVG_H-5}" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">LAUNCH ANGLE (°)</text>`;
  svg += `<text transform="rotate(-90)" x="${-(PAD_T + (SVG_H-PAD_T-PAD_B)/2)}" y="14" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10">EXIT VELO (mph)</text>`;

  svg += '</svg>';

  // Summary stats below chart
  let totalBBE = 0, totalBarrels = 0, totalHH = 0, sumEV = 0, nEV = 0;
  data.forEach(row => {
    const ev = parseFloat(row["launch_speed"]);
    const la = parseFloat(row["launch_angle"]);
    if(!isNaN(ev) && !isNaN(la)){
      totalBBE++;
      if(ev >= 98 && la >= 8 && la <= 32) totalBarrels++;
      if(ev >= 95) totalHH++;
      sumEV += ev; nEV++;
    }
  });
  const avgEV = nEV > 0 ? (sumEV/nEV).toFixed(1) : "--";
  const brlPct = totalBBE > 0 ? (totalBarrels/totalBBE*100).toFixed(1) : "--";
  const hhPct = totalBBE > 0 ? (totalHH/totalBBE*100).toFixed(1) : "--";

  let stats = '<div style="display:flex;gap:12px;justify-content:center;margin-top:4px;font-size:10px;color:#6b88aa">';
  stats += `<span>Avg EV: <b style="color:#c9d8ef">${avgEV}</b></span>`;
  stats += `<span>Barrel%: <b style="color:#92400E">${brlPct}%</b></span>`;
  stats += `<span>Hard Hit%: <b style="color:#047857">${hhPct}%</b></span>`;
  stats += `<span>BBE: <b style="color:#c9d8ef">${totalBBE}</b></span>`;
  stats += '</div>';

  // Color legend
  let legend = '<div class="legend" style="justify-content:center;margin-top:2px">';
  legend += '<div class="legend-item"><span style="width:8px;height:8px;border-radius:2px;background:rgba(224,62,82,.55);display:inline-block;margin-right:3px"></span>xBA .700+</div>';
  legend += '<div class="legend-item"><span style="width:8px;height:8px;border-radius:2px;background:rgba(232,201,106,.45);display:inline-block;margin-right:3px"></span>.500+</div>';
  legend += '<div class="legend-item"><span style="width:8px;height:8px;border-radius:2px;background:rgba(240,140,58,.3);display:inline-block;margin-right:3px"></span>.350+</div>';
  legend += '<div class="legend-item"><span style="width:8px;height:8px;border-radius:2px;background:rgba(45,206,137,.2);display:inline-block;margin-right:3px"></span>.250+</div>';
  legend += '<div class="legend-item"><span style="width:8px;height:8px;border-radius:2px;background:rgba(76,170,245,.15);display:inline-block;margin-right:3px"></span>&lt;.250</div>';
  legend += '</div>';

  container.innerHTML = svg + stats + legend;
}

function renderHitterZoneHeat(data) {
  const container = document.getElementById("pc-zoneheat");
  if (!container) return;
  
  // Create 3x3 grid
  const zones = {};
  data.forEach(row => {
    const px = parseFloat(row["plate_x"]);
    const pz = parseFloat(row["plate_z"]);
    if (!isNaN(px) && !isNaN(pz)) {
      let zx = 1, zz = 1;
      if (px < -0.3) zx = 0;
      else if (px > 0.3) zx = 2;
      if (pz < 2) zz = 0;
      else if (pz > 2.8) zz = 2;
      
      const key = `${zx}_${zz}`;
      if (!zones[key]) zones[key] = { xwoba: 0, count: 0 };
      zones[key].count++;
      const xwoba = parseFloat(row["estimated_woba_using_speedangle"]) || 0;
      zones[key].xwoba += xwoba;
    }
  });
  
  let svg = '<svg viewBox="0 0 400 320" style="width:100%;height:100%">';

  // Centered strike zone grid (3x3)
  svg += '<g transform="translate(110,30)">';
  svg += '<rect x="0" y="0" width="180" height="240" fill="none" stroke="rgba(45,36,24,.15)" stroke-width="1.5" rx="3"/>';

  const zoneRects = [
    {x:0, y:0, label:"0_2"}, {x:60, y:0, label:"1_2"}, {x:120, y:0, label:"2_2"},
    {x:0, y:80, label:"0_1"}, {x:60, y:80, label:"1_1"}, {x:120, y:80, label:"2_1"},
    {x:0, y:160, label:"0_0"}, {x:60, y:160, label:"1_0"}, {x:120, y:160, label:"2_0"}
  ];

  zoneRects.forEach(({x, y, label}) => {
    const zd = zones[label];
    const avgXwoba = zd ? (zd.xwoba / zd.count) : 0;
    // Color: hot (red), warm (orange), cold (blue)
    let fillColor, fillOpacity;
    if(avgXwoba > 0.400){ fillColor = "rgba(185,28,28,"; fillOpacity = Math.min(0.15 + avgXwoba * 0.6, 0.55); }
    else if(avgXwoba > 0.300){ fillColor = "rgba(194,65,12,"; fillOpacity = 0.25 + (avgXwoba - 0.3) * 1.5; }
    else { fillColor = "rgba(29,78,216,"; fillOpacity = 0.1 + (0.3 - avgXwoba) * 0.5; }

    svg += `<rect x="${x}" y="${y}" width="60" height="80" fill="${fillColor}${fillOpacity.toFixed(2)})" rx="2"/>`;
    if(zd && zd.count > 0){
      svg += `<text x="${x+30}" y="${y+45}" text-anchor="middle" fill="#2D2418" font-family="JetBrains Mono" font-size="13" font-weight="600">${avgXwoba.toFixed(3)}</text>`;
    }
  });

  // Grid lines
  svg += '<line x1="60" y1="0" x2="60" y2="240" stroke="rgba(45,36,24,.08)"/>';
  svg += '<line x1="120" y1="0" x2="120" y2="240" stroke="rgba(45,36,24,.08)"/>';
  svg += '<line x1="0" y1="80" x2="180" y2="80" stroke="rgba(45,36,24,.08)"/>';
  svg += '<line x1="0" y1="160" x2="180" y2="160" stroke="rgba(45,36,24,.08)"/>';
  svg += '</g>';

  // Labels
  svg += '<text x="200" y="295" text-anchor="middle" fill="#6b88aa" font-family="Barlow Condensed" font-size="10" letter-spacing="1">CATCHER\'S PERSPECTIVE</text>';
  svg += '<text x="80" y="155" text-anchor="end" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">Inner</text>';
  svg += '<text x="320" y="155" fill="#6b88aa" font-family="Barlow Condensed" font-size="9">Outer</text>';

  svg += '</svg>';

  let legend = '<div class="legend">' +
    '<div class="legend-item"><span style="width:12px;height:8px;border-radius:2px;background:rgba(224,62,82,.5);display:inline-block;margin-right:4px"></span>Hot (xwOBA &gt; .400)</div>' +
    '<div class="legend-item"><span style="width:12px;height:8px;border-radius:2px;background:rgba(240,140,58,.35);display:inline-block;margin-right:4px"></span>Warm (.300-.400)</div>' +
    '<div class="legend-item"><span style="width:12px;height:8px;border-radius:2px;background:rgba(76,170,245,.25);display:inline-block;margin-right:4px"></span>Cold (&lt; .300)</div>' +
    '</div>';

  container.innerHTML = svg + legend;
}

function renderHitterBBProfile(data, player) {
  const container = document.getElementById("pc-bbprofile");
  if (!container) return;
  
  const byType = {};
  data.forEach(row => {
    const bb = row["bb_type"] || "unknown";
    if (!byType[bb]) byType[bb] = [];
    byType[bb].push(row);
  });
  
  const total = data.length;
  const types = Object.keys(byType).sort((a, b) => byType[b].length - byType[a].length);
  
  let html = '<div style="margin-bottom:14px">';
  html += '<div style="font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:2px;color:var(--fg2);text-transform:uppercase;margin-bottom:6px">Distribution</div>';
  html += '<div style="display:flex;flex-direction:column;gap:5px">';
  
  types.forEach(bb => {
    const count = byType[bb].length;
    const pct = (count / total * 100).toFixed(1);
    const color = {"line_drive":"#047857","fly_ball":"#C2410C","ground_ball":"#1D4ED8","popup":"#B91C1C"}[bb] || "#6b88aa";
    const label = {"line_drive":"Line Drive","fly_ball":"Fly Ball","ground_ball":"Ground Ball","popup":"Popup"}[bb] || bb;
    html += `<div class="freq-bar-wrap"><span class="pitch-dot" style="background:${color}"></span><span style="font-family:var(--fh);font-size:10px;color:var(--fg2);width:80px">${label}</span><div class="freq-bar" style="width:${pct}%;background:${color}"></div><span class="freq-pct">${pct}%</span></div>`;
  });
  
  html += '</div></div>';
  
  // Diamond spray direction graphic — handedness-aware
  // Detect batter handedness from Savant "stand" field (R/L)
  let rhbCount = 0, lhbCount = 0;
  data.forEach(row => {
    const stand = (row["stand"] || "").toUpperCase();
    if(stand === "R") rhbCount++;
    else if(stand === "L") lhbCount++;
  });
  const isRHB = rhbCount >= lhbCount;

  // Savant hc_x: 125.42 = dead center (catcher's view, left→right)
  // For RHB: pull = left field (low hc_x), oppo = right field (high hc_x)
  // For LHB: pull = right field (high hc_x), oppo = left field (low hc_x)
  let pullN=0, centN=0, oppoN=0;
  data.forEach(row => {
    const hcx = parseFloat(row["hc_x"]);
    if(isNaN(hcx)) return;
    if(isRHB){
      if(hcx < 100) pullN++;
      else if(hcx > 150) oppoN++;
      else centN++;
    } else {
      // LHB: flip pull/oppo
      if(hcx > 150) pullN++;
      else if(hcx < 100) oppoN++;
      else centN++;
    }
  });
  const sprayTotal = pullN + centN + oppoN;
  const pullPct = sprayTotal > 0 ? (pullN/sprayTotal*100).toFixed(1) : "--";
  const centPct = sprayTotal > 0 ? (centN/sprayTotal*100).toFixed(1) : "--";
  const oppoPct = sprayTotal > 0 ? (oppoN/sprayTotal*100).toFixed(1) : "--";

  // For the diamond graphic, PULL is always drawn on the pull-field side:
  // RHB pull = left field (SVG left), LHB pull = right field (SVG right)
  const pullX = isRHB ? 50 : 210;
  const oppoX = isRHB ? 210 : 50;
  const pullFieldLabel = isRHB ? "LF" : "RF";
  const oppoFieldLabel = isRHB ? "RF" : "LF";
  // Zone fill colors: pull zone on appropriate side
  const pullZonePath = isRHB
    ? 'M130,130 L20,40 Q75,15 130,10 Z'   // left-field wedge
    : 'M130,130 L240,40 Q185,15 130,10 Z'; // right-field wedge
  const oppoZonePath = isRHB
    ? 'M130,130 L240,40 Q185,15 130,10 Z'  // right-field wedge
    : 'M130,130 L20,40 Q75,15 130,10 Z';   // left-field wedge

  html += `<div style="margin-bottom:14px">
    <div style="font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:2px;color:var(--fg2);text-transform:uppercase;margin-bottom:6px">Spray Direction <span style="font-weight:400;color:var(--fg4);letter-spacing:0">(${isRHB ? "RHB" : "LHB"})</span></div>
    <svg viewBox="0 0 260 140" style="width:100%;max-width:260px;display:block;margin:0 auto">
      <path d="M130,130 L20,40 Q130,0 240,40 Z" fill="none" stroke="rgba(45,36,24,.1)" stroke-width="1"/>
      <path d="${pullZonePath}" fill="rgba(139,8,24,.2)" stroke="rgba(139,8,24,.3)" stroke-width="0.5"/>
      <path d="M130,130 L87,22 Q130,6 173,22 Z" fill="rgba(146,64,14,.15)" stroke="rgba(146,64,14,.25)" stroke-width="0.5"/>
      <path d="${oppoZonePath}" fill="rgba(29,78,216,.15)" stroke="rgba(29,78,216,.25)" stroke-width="0.5"/>
      <line x1="130" y1="130" x2="20" y2="40" stroke="rgba(45,36,24,.12)" stroke-width="0.8"/>
      <line x1="130" y1="130" x2="240" y2="40" stroke="rgba(45,36,24,.12)" stroke-width="0.8"/>
      <path d="M130,110 L105,85 L130,60 L155,85 Z" fill="none" stroke="rgba(45,36,24,.12)" stroke-width="0.8"/>
      <rect x="127" y="126" width="6" height="6" fill="rgba(45,36,24,.2)" rx="1"/>
      <text x="${pullX}" y="28" text-anchor="middle" fill="#8B0818" font-family="Barlow Condensed" font-size="8" opacity=".5">${pullFieldLabel}</text>
      <text x="${pullX}" y="40" text-anchor="middle" fill="#8B0818" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="1">PULL</text>
      <text x="${pullX}" y="52" text-anchor="middle" fill="#8B0818" font-family="JetBrains Mono" font-size="11" font-weight="700">${pullPct}%</text>
      <text x="130" y="30" text-anchor="middle" fill="#92400E" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="1">CENTER</text>
      <text x="130" y="42" text-anchor="middle" fill="#92400E" font-family="JetBrains Mono" font-size="11" font-weight="700">${centPct}%</text>
      <text x="${oppoX}" y="28" text-anchor="middle" fill="#1D4ED8" font-family="Barlow Condensed" font-size="8" opacity=".5">${oppoFieldLabel}</text>
      <text x="${oppoX}" y="40" text-anchor="middle" fill="#1D4ED8" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="1">OPPO</text>
      <text x="${oppoX}" y="52" text-anchor="middle" fill="#1D4ED8" font-family="JetBrains Mono" font-size="11" font-weight="700">${oppoPct}%</text>
    </svg>
  </div>`;

  // Quality of contact table with vs Avg
  html += '<div><div style="font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:2px;color:var(--fg2);text-transform:uppercase;margin-bottom:4px">Quality of Contact</div>';
  html += '<table class="stat-tbl"><thead><tr><th>Metric</th><th>Value</th><th>vs Avg</th></tr></thead><tbody>';

  let avgEv = 0, maxEv = 0, barrelCount = 0, hardCount = 0, sweetCount = 0, count = 0, laSum = 0;
  data.forEach(row => {
    const ev = parseFloat(row["launch_speed"]);
    const la = parseFloat(row["launch_angle"]);
    if (!isNaN(ev)) {
      avgEv += ev; count++;
      if(ev > maxEv) maxEv = ev;
      if(ev >= 95) hardCount++;
      if(ev >= 98 && !isNaN(la) && la >= 8 && la <= 32) barrelCount++;
    }
    if(!isNaN(la)){ laSum += la; if(la >= 8 && la <= 32) sweetCount++; }
  });
  avgEv = count > 0 ? avgEv / count : 0;
  const avgLA = count > 0 ? laSum / count : 0;
  const hardPct = count > 0 ? (hardCount/count*100) : 0;
  const barrelPct = count > 0 ? (barrelCount/count*100) : 0;
  const sweetPct = count > 0 ? (sweetCount/count*100) : 0;

  function vsAvg(val, avg, fmt, lower){
    const diff = val - avg;
    const cls = lower ? (diff < 0 ? "heat-good" : diff > 0 ? "heat-bad" : "heat-neutral") : (diff > 0 ? "heat-good" : diff < 0 ? "heat-bad" : "heat-neutral");
    return `<td class="${cls}">${diff > 0 ? "+" : ""}${fmt === "f1" ? diff.toFixed(1) : fmt === "f3" ? diff.toFixed(3) : diff.toFixed(1)}</td>`;
  }

  html += `<tr><td style="color:var(--fg2)">Avg Exit Velo</td><td>${avgEv.toFixed(1)} mph</td>${vsAvg(avgEv, 88.9, "f1")}</tr>`;
  html += `<tr><td style="color:var(--fg2)">Max Exit Velo</td><td>${maxEv.toFixed(1)} mph</td>${vsAvg(maxEv, 109.7, "f1")}</tr>`;
  html += `<tr><td style="color:var(--fg2)">Barrel%</td><td>${barrelPct.toFixed(1)}%</td>${vsAvg(barrelPct, 8.4, "f1")}</tr>`;
  html += `<tr><td style="color:var(--fg2)">Hard Hit%</td><td>${hardPct.toFixed(1)}%</td>${vsAvg(hardPct, 38.3, "f1")}</tr>`;
  html += `<tr><td style="color:var(--fg2)">Sweet Spot%</td><td>${sweetPct.toFixed(1)}%</td>${vsAvg(sweetPct, 34.9, "f1")}</tr>`;
  html += `<tr><td style="color:var(--fg2)">Avg LA</td><td>${avgLA.toFixed(1)}°</td><td class="heat-neutral">${(avgLA-11.6)>0?"+":""}${(avgLA-11.6).toFixed(1)}</td></tr>`;
  if(player.xba != null) html += `<tr><td style="color:var(--fg2)">xBA</td><td>${player.xba.toFixed(3)}</td>${vsAvg(player.xba, 0.248, "f3")}</tr>`;
  if(player.xslg != null) html += `<tr><td style="color:var(--fg2)">xSLG</td><td>${player.xslg.toFixed(3)}</td>${vsAvg(player.xslg, 0.402, "f3")}</tr>`;
  html += '</tbody></table></div>';

  container.innerHTML = html;
}

// ── ROW MAPPERS ──────────────────────────────────────────────────────────────
function mapHitter(fg, sv, sp){
  // FanGraphs ships team as HTML <a> link; strip to plain abbreviation so the
  // team-filter dropdown can do an exact-match comparison (was matching on a
  // 135-char HTML string and never finding any rows).
  const teamRaw = stripHTML(fg["Team"]||fg["team"]||"");
  const team = (teamRaw==="- - -"||teamRaw==="---") ? (sv?sv["team_name_abbrev"]||"":"") : teamRaw;
  return {
    name:       stripHTML(fg["Name"]||fg["PlayerName"]||""),
    team,
    age:        nf(fg["Age"]||fg["age"]),
    pos:        fg["pos"]||fg["Position"]||"",
    ab:         nf(fg["AB"]||fg["ab"]),
    pa:         nf(fg["PA"]||fg["pa"]),
    avg:        nf(fg["AVG"]||fg["avg"]),
    obp:        nf(fg["OBP"]||fg["obp"]),
    slg:        nf(fg["SLG"]||fg["slg"]),
    ops:        nf(fg["OPS"]||fg["ops"]),
    hr:         nf(fg["HR"]||fg["hr"]),
    rbi:        nf(fg["RBI"]||fg["rbi"]),
    sb:         nf(fg["SB"]||fg["sb"]),
    wrc_plus:   nf(fg["wRC+"]||fg["wRCPlus"]||fg["wrc_plus"]),
    woba:       nf(fg["wOBA"]||fg["woba"]),
    war:        nf(fg["WAR"]||fg["war"]),
    k_pct:      pct(fg["K%"]||fg["SO%"]),
    bb_pct:     pct(fg["BB%"]),
    babip:      nf(fg["BABIP"]||fg["babip"]),
    iso:        nf(fg["ISO"]||fg["iso"]),
    swstr:      pct(fg["SwStr%"]||fg["SwStrk%"]),
    // Savant xStats (from expected_statistics CSV or MLB Stats API fallback)
    xwoba:      sv ? nf(sv["est_woba"]||sv["xwoba"]||sv["expectedBattingAvg"]) : null,
    xba:        sv ? nf(sv["est_ba"]||sv["xba"])     : null,
    xslg:       sv ? nf(sv["est_slg"]||sv["xslg"])   : null,
    // Barrel%, EV, HardHit%: FG type=8 returns these as Barrel% (decimal 0-1), EV (mph), HardHit% (decimal 0-1)
    // Savant expected_statistics CSV does NOT include these fields — pull from FG primary, Savant fallback
    // FG returns Barrel% as decimal (e.g., 0.125 = 12.5%) — multiply by 100 for display percentage
    brl_pct:    nf(fg["Barrel%"]) != null ? nf(fg["Barrel%"]) * 100
                : (sv ? nf(sv["barrel_batted_rate"]||sv["brl_percent"]||sv["brl_pa"]) : null),
    ev:         nf(fg["EV"]) || (sv ? nf(sv["avg_hit_speed"]||sv["exit_velocity_avg"]) : null),
    hard_hit:   nf(fg["HardHit%"]) != null ? nf(fg["HardHit%"]) * 100
                : nf(fg["Hard%"]) != null ? nf(fg["Hard%"]) * 100
                : (sv ? nf(sv["hard_hit_percent"]||sv["hard_hit"]) : null),
    // Sprint speed
    sprint_spd: sp ? nf(sp["hp_to_1b"]||sp["sprint_speed"]||sp["r_sprint_speed_top50p"]) : null,
    // Player IDs for Statcast
    // Primary: FanGraphs xMLBAMID (available for nearly all FG players)
    // Fallback: Savant player_id (only if name match succeeded)
    mlbam_id:   nf(fg["xMLBAMID"]) || nf(fg["MLBAMID"]) || nf(fg["mlbamid"]) || (sv ? nf(sv["player_id"]) : null),
    fg_id:      fg["playerid"] || null,
  };
}

function mapPitcher(fg, sv, disc){
  const g  = nf(fg["G"]||fg["g"])||1;
  const gs = nf(fg["GS"]||fg["gs"])||0;
  const teamRaw = stripHTML(fg["Team"]||fg["team"]||"");
  const team = (teamRaw==="- - -"||teamRaw==="---"||teamRaw==="TOT") ? (sv?sv["team_name_abbrev"]||"":"") : teamRaw;
  // CSW% from FG plate-discipline call; SwStr% from same
  const cswPct = disc ? pct(disc["CSW%"]||disc["csw_pct"]||disc["CStr%"]) : null;
  const swstrDisc = disc ? pct(disc["SwStr%"]||disc["SwStrk%"]||disc["swstr_pct"]) : null;
  return {
    name:    stripHTML(fg["Name"]||fg["PlayerName"]||fg["player_name"]||""),
    team,
    age:     nf(fg["Age"]||fg["age"]),
    role:    (gs/g)>=0.5 ? "SP" : "RP",
    g:       nf(fg["G"]||fg["g"]),
    gs:      nf(fg["GS"]||fg["gs"]),
    ip:      nf(fg["IP"]||fg["ip"]),
    era:     nf(fg["ERA"]||fg["era"]),
    fip:     nf(fg["FIP"]||fg["fip"]),
    xfip:    nf(fg["xFIP"]||fg["xfip"]),
    whip:    nf(fg["WHIP"]||fg["whip"]),
    k9:      nf(fg["K/9"]||fg["SO9"]||fg["k9"]||fg["K9"]),
    bb9:     nf(fg["BB/9"]||fg["bb9"]||fg["BB9"]),
    k_pct:   pct(fg["K%"]||fg["SO%"]||fg["k_pct"]),
    bb_pct:  pct(fg["BB%"]||fg["bb_pct"]),
    war:     nf(fg["WAR"]||fg["war"]),
    swstr:   pct(fg["SwStr%"]||fg["SwStrk%"]||fg["swstr_pct"]) || swstrDisc,
    gb_pct:  pct(fg["GB%"]||fg["gb_pct"]),
    lob:     pct(fg["LOB%"]||fg["lob_pct"]),
    hr9:     nf(fg["HR/9"]||fg["hr9"]||fg["HR9"]),
    // Plate discipline enrichment (from secondary FG type=7 fetch)
    csw:     cswPct,
    // Savant + FG Statcast enrichment
    // FG type=8 returns Barrel% (decimal 0-1), EV (mph), HardHit% (decimal 0-1) — verified 2026-03-27
    xera:    nf(fg["xERA"]||fg["xera"]) || (sv ? nf(sv["xera"]||sv["est_era"]||sv["expectedEra"]) : null),
    brl_pct: nf(fg["Barrel%"]) != null ? nf(fg["Barrel%"]) * 100
             : (sv ? nf(sv["barrel_batted_rate"]||sv["brl_percent"]||sv["barrelBattedRate"]) : null),
    ev:      nf(fg["EV"]) || (sv ? nf(sv["avg_hit_speed"]||sv["exit_velocity_avg"]||sv["exitVelocity"]) : null),
    whiff:   sv ? nf(sv["whiff_percent"]||sv["whiff_pct"]||sv["whiffPercent"]) : null,
    velo:    sv ? nf(sv["avg_best_speed"]||sv["ff_avg_speed"]||sv["release_speed_avg"]||sv["pitchVelocity"]) : null,
    // Player IDs — FanGraphs xMLBAMID is the most reliable cross-reference
    mlbam_id: nf(fg["xMLBAMID"]) || nf(fg["MLBAMID"]) || nf(fg["mlbamid"]) || (sv ? nf(sv["player_id"]) : null),
    fg_id:    fg["playerid"] || null,
  };
}

// ── MERGE ────────────────────────────────────────────────────────────────────
// Build a secondary Savant/Statcast index keyed by player_id (MLBAM ID) for direct ID-based lookup.
// Handles both Savant CSV format (field "player_id") and MLB Stats API format (field "player_id" set by fetchMLBStatsAPI).
function buildSavantIdIdx(svRows){
  const idx = {};
  svRows.forEach(row => {
    const pid = row["player_id"];
    if(pid) idx[String(pid)] = row;
  });
  return idx;
}

function mergeHitters(fgRows, svRows, spRows, minAB){
  // Diagnostic: check what ID fields FanGraphs actually returns
  if(fgRows.length > 0){
    const sample = fgRows[0];
    const hasXMLBAMID = "xMLBAMID" in sample;
    const hasMLBAMID = "MLBAMID" in sample;
    const hasmlbamid = "mlbamid" in sample;
    console.log(`[merge-diag] FG hitter fields check — xMLBAMID:${hasXMLBAMID} MLBAMID:${hasMLBAMID} mlbamid:${hasmlbamid}`,
      hasXMLBAMID ? `(sample val: ${sample.xMLBAMID})` : "(not present)");
    // If no MLBAM ID field found, log all keys for debugging
    if(!hasXMLBAMID && !hasMLBAMID && !hasmlbamid){
      console.warn("[merge-diag] No xMLBAMID field found in FG response. Available keys:", Object.keys(sample).join(", "));
    }
  }
  const svIdx = buildIdx(svRows, r => savantNameToNorm(r["last_name, first_name"]||r["player_name"]||""));
  const svIdIdx = buildSavantIdIdx(svRows); // index by MLBAM ID for direct lookup
  const spIdx = buildIdx(spRows, r => normName((r["last_name"]||"")+" "+(r["first_name"]||"")));
  let matchCount = 0;
  let idCount = 0;
  const result = fgRows
    .filter(r => nf(r["AB"]||r["ab"]||0) >= minAB)
    .map(r => {
      const k = normName(stripHTML(r["Name"]||r["PlayerName"]||""));
      // Try name-based match first, then fall back to MLBAM ID lookup
      let sv = fuzzyLookup(k, svIdx);
      if(!sv){
        const mlbamFromFG = String(r["xMLBAMID"]||r["MLBAMID"]||r["mlbamid"]||"");
        if(mlbamFromFG && svIdIdx[mlbamFromFG]) sv = svIdIdx[mlbamFromFG];
      }
      const sp = fuzzyLookup(k, spIdx);
      if(sv) matchCount++;
      const mapped = mapHitter(r, sv, sp);
      if(mapped.mlbam_id) idCount++;
      return mapped;
    })
    .filter(r => r.name);
  console.log(`[merge] Hitters: ${result.length} total, ${matchCount}/${fgRows.length} matched Savant xStats, ${idCount} have MLBAM ID`);
  return result;
}

function mergePitchers(fgRows, svRows, minIP, discRows){
  // Diagnostic: log field availability in FG response
  if(fgRows.length > 0){
    const sample = fgRows[0];
    const hasXMLBAMID = "xMLBAMID" in sample;
    const hasMLBAMID  = "MLBAMID"  in sample;
    console.log(`[merge-diag] FG pitcher: xMLBAMID=${hasXMLBAMID}, MLBAMID=${hasMLBAMID}`,
      hasXMLBAMID ? `(sample: ${sample.xMLBAMID})` : "");
  }
  const svIdx   = buildIdx(svRows,   r => savantNameToNorm(r["last_name, first_name"]||r["player_name"]||""));
  const svIdIdx = buildSavantIdIdx(svRows);
  // Build discipline index by normalized name for CSW% enrichment
  const discIdx = discRows && discRows.length
    ? buildIdx(discRows, r => normName(stripHTML(r["Name"]||r["PlayerName"]||r["player_name"]||"")))
    : {};
  let matchCount = 0, idCount = 0;
  const result = fgRows
    .filter(r => nf(r["IP"]||r["ip"]||0) >= minIP)
    .map(r => {
      const k = normName(stripHTML(r["Name"]||r["PlayerName"]||r["player_name"]||""));
      let sv = fuzzyLookup(k, svIdx);
      if(!sv){
        const mid = String(r["xMLBAMID"]||r["MLBAMID"]||r["mlbamid"]||"");
        if(mid && svIdIdx[mid]) sv = svIdIdx[mid];
      }
      const disc = discIdx[k] || null;
      if(sv) matchCount++;
      const mapped = mapPitcher(r, sv, disc);
      if(mapped.mlbam_id) idCount++;
      return mapped;
    })
    .filter(r => r.name);
  console.log(`[merge] Pitchers: ${result.length} total, ${matchCount}/${fgRows.length} matched Savant, ${idCount} have MLBAM ID`);
  return result;
}

// ── DATE RANGE STATE ─────────────────────────────────────────────────────────
// dateRange: null = full season, otherwise {startdate:"YYYY-MM-DD", enddate:"YYYY-MM-DD", label:"Last 30d"}
let _dateRange = null;

function getDateRangeKey(){
  if(!_dateRange) return "full";
  return _dateRange.startdate + "_" + _dateRange.enddate;
}

function fmtDate(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function setDatePreset(btn){
  // Update button active state
  document.querySelectorAll(".dp-btn").forEach(b=>b.classList.remove("dp-active"));
  btn.classList.add("dp-active");

  const range = btn.getAttribute("data-range");
  if(range === "full"){
    _dateRange = null;
    document.getElementById("date-from").value = "";
    document.getElementById("date-to").value = "";
    document.getElementById("date-note").textContent = "Full season stats";
  } else {
    const days = parseInt(range);
    const end = new Date();
    const start = new Date(end); start.setDate(start.getDate() - days);
    _dateRange = { startdate: fmtDate(start), enddate: fmtDate(end), label: "Last "+days+"d" };
    document.getElementById("date-from").value = _dateRange.startdate;
    document.getElementById("date-to").value = _dateRange.enddate;
    document.getElementById("date-note").textContent = "FG: date-filtered · Savant: full season";
  }

  // Clear cache for this range and reload
  if(SEASON === 2026){
    clearCache();
    DB[2026].loaded = false;
    loadLive2026(true);
  }
}

function setCustomDateRange(){
  const from = document.getElementById("date-from").value;
  const to   = document.getElementById("date-to").value;
  if(!from || !to) return;
  if(from > to){ alert("Start date must be before end date"); return; }

  // Deactivate preset buttons
  document.querySelectorAll(".dp-btn").forEach(b=>b.classList.remove("dp-active"));

  _dateRange = { startdate: from, enddate: to, label: from+" to "+to };
  document.getElementById("date-note").textContent = "FG: "+from+" → "+to+" · Savant: full season";

  if(SEASON === 2026){
    clearCache();
    DB[2026].loaded = false;
    loadLive2026(true);
  }
}

// ── CACHE HELPERS (localStorage with TTL) ────────────────────────────────────
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function cacheKey(){
  return "mlb_stats_2026_" + getDateRangeKey();
}

function saveCache(hitters, pitchers){
  try {
    const payload = { ts: Date.now(), hitters, pitchers, dateRange: getDateRangeKey() };
    localStorage.setItem(cacheKey(), JSON.stringify(payload));
    console.log(`[cache] Saved ${hitters.length} hitters, ${pitchers.length} pitchers (${getDateRangeKey()})`);
  } catch(e){ console.warn("[cache] Save failed:",e.message); }
}

function loadCache(){
  try {
    const raw = localStorage.getItem(cacheKey());
    if(!raw) return null;
    const data = JSON.parse(raw);
    if(Date.now() - data.ts > CACHE_TTL){
      console.log("[cache] Expired, will refresh");
      return { ...data, expired: true };
    }
    console.log(`[cache] Fresh (${Math.round((Date.now()-data.ts)/1000)}s old, range: ${getDateRangeKey()})`);
    return { ...data, expired: false };
  } catch(e){ return null; }
}

function clearCache(){
  // Clear current range cache
  localStorage.removeItem(cacheKey());
  // Also clear all mlb_stats_2026 caches if we want a full wipe
  for(let i=localStorage.length-1; i>=0; i--){
    const k = localStorage.key(i);
    if(k && k.startsWith("mlb_stats_2026_")) localStorage.removeItem(k);
  }
}

// ── SEASON THRESHOLDS ────────────────────────────────────────────────────────
function getSeasonThresholds(){
  const openDay = new Date("2026-03-26");
  const today   = new Date();
  const daysIn  = Math.max(0, Math.floor((today - openDay) / 86400000));

  // Progressive thresholds: broader early, tighter as season progresses
  // FG qual: PA/IP threshold for API call (lower = more players returned)
  // minAB/minIP: client-side filter applied after merge (what we display)
  // NOTE: After just 1-3 days of play, most players have only 3-5 PA/0-1 IP,
  //       so we must use qual=1 (any appearance) in the first week.
  let fgQualBat, fgQualPit, svMin, minAB, minIP;

  if(daysIn < 30){
    // Days 1-30: early season pitching uses qual=0 to get all pitchers
    fgQualBat = 1;  fgQualPit = 0;  svMin = 1;  minAB = 1;  minIP = 0.1;
  } else if(daysIn < 10){
    // Days 4-10: small sample, ~3 games
    fgQualBat = 5;  fgQualPit = 3;  svMin = 5;  minAB = 3;  minIP = 2;
  } else if(daysIn < 21){
    // Days 10-21: ~2 weeks in
    fgQualBat = 15; fgQualPit = 6;  svMin = 10; minAB = 10; minIP = 5;
  } else if(daysIn < 42){
    // Weeks 3-6: moderate pool
    fgQualBat = 40; fgQualPit = 15; svMin = 25; minAB = 25; minIP = 12;
  } else if(daysIn < 84){
    // Weeks 6-12: semi-qualified
    fgQualBat = 80; fgQualPit = 30; svMin = 50; minAB = 50; minIP = 25;
  } else {
    // 12+ weeks: approach qualified, still broader than FG default
    fgQualBat = 150; fgQualPit = 50; svMin = 75; minAB = 80; minIP = 40;
  }

  console.log(`[thresholds] ${daysIn} days in → FG bat qual:${fgQualBat} pit qual:${fgQualPit}, Savant min:${svMin}, minAB:${minAB}, minIP:${minIP}`);
  return { daysIn, fgQualBat, fgQualPit, svMin, minAB, minIP };
}

// ── STATIC 2026 DATA LOADER — loads from pre-fetched static JSON files ──
// Fetches data/fg-bat.json, data/fg-pit.json, data/fg-disc-pit.json, data/sv-bat.json,
// data/sv-pit.json, data/sv-sprint.json, and data/meta.json (all saved by GitHub Actions).
// This provides instant data loading for both GitHub Pages (same-origin fetch) and local (file://) testing.
// Returns true if data was loaded successfully, false otherwise.
async function loadStaticData2026(){
  const { minAB, minIP } = getSeasonThresholds();
  const dateMinAB = _dateRange ? Math.max(1, Math.round(minAB * 0.3)) : minAB;
  const dateMinIP = _dateRange ? Math.max(0.1, minIP * 0.3) : minIP;

  let fgBat=[], fgPit=[], svBat=[], svPit=[], spd=[], discPit=[];

  try {
    // Determine base path: for GitHub Pages it's '', for file:// it may need '../' or similar
    // Try both with and without relative path prefix
    const fetchStaticFile = async (filename) => {
      try {
        // First try direct path (GitHub Pages)
        const resp = await fetch(`data/${filename}`);
        if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
      } catch(e1){
        try {
          // Fallback for file:// or alternative base paths
          const resp = await fetch(`../data/${filename}`);
          if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
          return await resp.json();
        } catch(e2){
          console.warn(`[static-load] Failed to load ${filename}:`, e1.message, e2.message);
          return null;
        }
      }
    };

    // Load all static files in parallel (timeout if needed)
    setProg(2, "Loading static FanGraphs batting...");
    fgBat = await fetchStaticFile("fg-bat.json") || [];

    setProg(5, "Loading static FanGraphs pitching...");
    fgPit = await fetchStaticFile("fg-pit.json") || [];

    setProg(8, "Loading static FanGraphs discipline...");
    discPit = await fetchStaticFile("fg-disc-pit.json") || [];

    setProg(12, "Loading static Savant batting...");
    svBat = await fetchStaticFile("sv-bat.json") || [];

    setProg(16, "Loading static Savant pitching...");
    svPit = await fetchStaticFile("sv-pit.json") || [];

    setProg(19, "Loading static Savant sprint...");
    spd = await fetchStaticFile("sv-sprint.json") || [];

    // Record snapshot age for the background-refresh gate.
    try {
      const meta = await fetchStaticFile("meta.json");
      if (meta && meta.fetchedAt) {
        const fetchedAt = Date.parse(meta.fetchedAt);
        if (!isNaN(fetchedAt)) DB[2026]._snapshotFetchedAt = fetchedAt;
      }
    } catch(_) { /* meta is best-effort */ }

    // If we got at least FG batting or pitching data, merge and store
    if(fgBat.length > 0 || fgPit.length > 0){
      setProg(25, "Merging static datasets...");

      const newHitters  = fgBat.length > 0 ? mergeHitters(fgBat, svBat, spd, dateMinAB) : [];
      const newPitchers = fgPit.length > 0 ? mergePitchers(fgPit, svPit, dateMinIP, discPit) : [];

      DB[2026].hitters   = newHitters;
      DB[2026].pitchers  = newPitchers;
      DB[2026].loaded    = true;
      DB[2026].lastFetch = Date.now();

      rebuildTeamDropdown(2026);

      console.log(`[loadStaticData2026] Loaded: FG bat=${fgBat.length} pit=${fgPit.length} disc=${discPit.length}, Savant bat=${svBat.length} pit=${svPit.length} spd=${spd.length}`);
      console.log(`[loadStaticData2026] Merged to: ${newHitters.length} hitters, ${newPitchers.length} pitchers`);
      return true;
    } else {
      console.warn("[loadStaticData2026] No FanGraphs data found in static files");
      return false;
    }
  } catch(err){
    console.error("[loadStaticData2026] Unexpected error:", err);
    return false;
  }
}

// ── LIVE 2026 LOADER — fetches directly from FanGraphs + Savant via CORS proxies ──
// Uses the proxyFetch() chain (direct → corsproxy.io → allorigins → thingproxy → codetabs)
// for FanGraphs JSON API, and the same chain for Savant CSV endpoints.
// FG and Savant data are merged on player name / MLBAM ID.
async function loadLive2026(forceRefresh){
  if(_fetching26) return;

  // Already loaded and not forcing? Just render
  if(!forceRefresh && DB[2026].loaded && DB[2026].hitters.length>0){ render(); return; }
  _fetching26 = true;

  const badge = document.getElementById("s-badge");
  badge.textContent = "LOADING...";
  badge.className = "s-badge badge-loading";
  showBar(true);
  setProg(0,"Fetching 2026 data...");

  const { fgQualBat, fgQualPit, svMin, minAB, minIP } = getSeasonThresholds();
  const dateMinAB = _dateRange ? Math.max(1, Math.round(minAB * 0.3)) : minAB;
  const dateMinIP = _dateRange ? Math.max(0.1, minIP * 0.3) : minIP;

  let fgBat=[], fgPit=[], svBat=[], svPit=[], spd=[], discPit=[];
  let errors = [];
  let staticLoaded = false;

  try {
    // ── Step 0: Try loading from static files first (instant load) ──
    setProg(0,"Loading static data (GitHub Actions fetch)...");
    staticLoaded = await loadStaticData2026();

    if(staticLoaded){
      setProg(30,"Static data loaded, rendering...");
      const rangeSuffix = _dateRange ? " · "+_dateRange.label : "";
      badge.textContent = "2026 STATIC" + rangeSuffix;
      badge.className = "s-badge badge-live";
      setTimeout(()=>showBar(false), 600);
      render();

      // Background: attempt live refresh for freshest data
      setProg(30,"Attempting live data refresh in background...");
      console.log("[loadLive2026] Static data loaded; attempting live refresh in background...");
      // Schedule a refresh in the background without blocking the UI
      setTimeout(() => refreshLiveDataInBackground(), 100);
      _fetching26 = false;
      return;
    }

    // ── Step 1: Fetch FanGraphs data (JSON via CORS proxy chain) ──
    setProg(35,"Fetching FanGraphs batting...");
    try { fgBat = await fetchFG(2026, "bat", fgQualBat, _dateRange||{}); }
    catch(e){ errors.push("FG bat: "+e.message); console.error("[2026] FG bat error:", e.message); }

    setProg(20,"Fetching FanGraphs pitching...");
    try { fgPit = await fetchFG(2026, "pit", fgQualPit, _dateRange||{}); }
    catch(e){ errors.push("FG pit: "+e.message); console.error("[2026] FG pit error:", e.message); }

    setProg(35,"Fetching FanGraphs discipline...");
    try { discPit = await fetchFGDiscipline(2026, "pit", fgQualPit); }
    catch(e){ errors.push("FG disc: "+e.message); console.error("[2026] FG discipline error:", e.message); }

    // ── Step 2: Fetch Savant/Statcast data (SEPARATE pipeline from FG) ──
    // Uses dedicated Savant fetch chain: direct fetch → Savant-specific proxies → MLB Stats API fallback
    setProg(50,"Fetching Savant xStats (batters)...");
    try { svBat = await fetchSavantXStats(2026, "batter", svMin); }
    catch(e){
      console.warn("[2026] Savant bat xStats failed, trying MLB Stats API fallback:", e.message);
      try {
        const mlbBat = await fetchMLBStatsAPI(2026, "hitting");
        if(mlbBat.length > 0) svBat = mlbBat;
      } catch(e2){ errors.push("Savant bat: "+e.message+" / MLB API: "+e2.message); }
    }

    setProg(60,"Fetching Savant xStats (pitchers)...");
    try { svPit = await fetchSavantXStats(2026, "pitcher", svMin); }
    catch(e){
      console.warn("[2026] Savant pit xStats failed, trying MLB Stats API fallback:", e.message);
      try {
        const mlbPit = await fetchMLBStatsAPI(2026, "pitching");
        if(mlbPit.length > 0) svPit = mlbPit;
      } catch(e2){ errors.push("Savant pit: "+e.message+" / MLB API: "+e2.message); }
    }

    setProg(70,"Fetching Savant sprint speed...");
    try { spd = await fetchSavantSprint(2026); }
    catch(e){ errors.push("Savant spd: "+e.message); console.error("[2026] Savant sprint error:", e.message); }

    // ── Step 3: Merge FG + Savant on player name / MLBAM ID ──
    setProg(80,"Merging FanGraphs + Savant datasets...");

    console.log(`[loadLive2026] Fetched: FG bat=${fgBat.length} pit=${fgPit.length} disc=${discPit.length}, Savant bat=${svBat.length} pit=${svPit.length} spd=${spd.length}, errors=${errors.length}`);

    if(fgBat.length > 0 || fgPit.length > 0){
      const newHitters  = fgBat.length > 0 ? mergeHitters(fgBat, svBat, spd, dateMinAB) : DB[2026].hitters;
      const newPitchers = fgPit.length > 0 ? mergePitchers(fgPit, svPit, dateMinIP, discPit) : DB[2026].pitchers;

      DB[2026].hitters   = newHitters;
      DB[2026].pitchers  = newPitchers;
      DB[2026].loaded    = true;
      DB[2026].lastFetch = Date.now();
      setProg(100,"Done");

      saveCache(newHitters, newPitchers);
      rebuildTeamDropdown(2026);

      const rangeSuffix = _dateRange ? " · "+_dateRange.label : "";
      if(errors.length === 0){
        badge.textContent = "2026 LIVE" + rangeSuffix;
        badge.className = "s-badge badge-live";
      } else {
        // FG data loaded but some Savant calls may have failed — still usable
        badge.textContent = "2026 LIVE (partial Savant)" + rangeSuffix;
        badge.className = "s-badge badge-loading";
        console.warn("[loadLive2026] Partial load, errors:", errors);
      }

      setTimeout(()=>showBar(false), 600);
      render();

    } else {
      throw new Error("FanGraphs returned 0 rows — season data may not be available yet");
    }

  } catch(err){
    console.error("2026 load error:", err);
    const errEl = document.getElementById("fetch-err");
    const detail = err.message.length > 80 ? err.message.slice(0,80)+"…" : err.message;
    errEl.textContent = "Data load failed: " + detail + " — " + (DB[2026].loaded?"using cached data":"using 2025 reference data");
    errEl.style.display = "inline";

    if(!DB[2026].loaded || DB[2026].hitters.length === 0){
      badge.textContent = "2026 (2025 REF)";
      badge.className = "s-badge badge-final";
      DB[2026].hitters  = SEED_H25.map(p=>({...p}));
      DB[2026].pitchers = SEED_P25.map(p=>({...p}));
      DB[2026].loaded   = true;
      rebuildTeamDropdown(2026);
      render();
    } else {
      badge.textContent = "2026 CACHED";
      badge.className = "s-badge badge-loading";
    }
    setTimeout(()=>showBar(false), 3000);
  } finally {
    _fetching26 = false;
  }
}

// ── TEAM DROPDOWN REBUILDER ──────────────────────────────────────────────────
function rebuildTeamDropdown(season){
  const src = season===2025 ? SEED_H25.concat(SEED_P25) : DB[2026].hitters.concat(DB[2026].pitchers);
  const teams = [...new Set(src.map(p=>p.team).filter(Boolean))].sort();
  document.getElementById("tm-sel").innerHTML = ["All Teams",...teams].map(t=>"<option>"+t+"</option>").join("");
}

// ── AUTO-REFRESH (every 15min while on 2026 tab) ────────────────────────────
let _refreshInterval = null;
function startAutoRefresh(){
  stopAutoRefresh();
  _refreshInterval = setInterval(()=>{
    if(SEASON === 2026 && !_fetching26){
      console.log("[auto-refresh] Refreshing 2026 data...");
      loadLive2026(true);
    }
  }, 15 * 60 * 1000); // every 15 minutes
}
function stopAutoRefresh(){
  if(_refreshInterval){ clearInterval(_refreshInterval); _refreshInterval=null; }
}

// Manual refresh handler (called from UI button)
function manualRefresh(){
  if(SEASON !== 2026) return;
  clearCache();
  DB[2026].loaded = false;
  loadLive2026(true);
}

// Background live data refresh (tries to refresh from live CORS proxies after static load)
// Does not display progress bar or block UI, only logs errors if they occur
async function refreshLiveDataInBackground(){
  if(_fetching26) return;

  // Skip the live refresh when our static snapshot is fresh enough.
  // GitHub Actions writes data/*.json + meta.json daily; if the snapshot is
  // less than 6h old there is no value in hammering CORS proxies.
  const STATIC_FRESH_MS = 6 * 60 * 60 * 1000;
  const snapAt = DB[2026] && DB[2026]._snapshotFetchedAt;
  if (snapAt && (Date.now() - snapAt) < STATIC_FRESH_MS) {
    console.log("[refreshLiveDataInBackground] Static snapshot is fresh (age "
      + Math.round((Date.now()-snapAt)/60000) + "m); skipping live refresh.");
    return;
  }

  _fetching26 = true;

  const { fgQualBat, fgQualPit, svMin, minAB, minIP } = getSeasonThresholds();
  const dateMinAB = _dateRange ? Math.max(1, Math.round(minAB * 0.3)) : minAB;
  const dateMinIP = _dateRange ? Math.max(0.1, minIP * 0.3) : minIP;

  let fgBat=[], fgPit=[], svBat=[], svPit=[], spd=[], discPit=[];
  let errors = [];

  try {
    // Try to fetch live data (but don't block, show no UI)
    try { fgBat = await fetchFG(2026, "bat", fgQualBat, _dateRange||{}); }
    catch(e){ errors.push("FG bat: "+e.message); }

    try { fgPit = await fetchFG(2026, "pit", fgQualPit, _dateRange||{}); }
    catch(e){ errors.push("FG pit: "+e.message); }

    try { discPit = await fetchFGDiscipline(2026, "pit", fgQualPit); }
    catch(e){ errors.push("FG disc: "+e.message); }

    try { svBat = await fetchSavantXStats(2026, "batter", svMin); }
    catch(e){
      try { const mlbBat = await fetchMLBStatsAPI(2026, "hitting"); if(mlbBat.length > 0) svBat = mlbBat; }
      catch(e2){ errors.push("Savant bat: "+e.message); }
    }

    try { svPit = await fetchSavantXStats(2026, "pitcher", svMin); }
    catch(e){
      try { const mlbPit = await fetchMLBStatsAPI(2026, "pitching"); if(mlbPit.length > 0) svPit = mlbPit; }
      catch(e2){ errors.push("Savant pit: "+e.message); }
    }

    try { spd = await fetchSavantSprint(2026); }
    catch(e){ errors.push("Savant spd: "+e.message); }

    // If we got any live data, merge and update (silently)
    if(fgBat.length > 0 || fgPit.length > 0){
      const newHitters  = fgBat.length > 0 ? mergeHitters(fgBat, svBat, spd, dateMinAB) : DB[2026].hitters;
      const newPitchers = fgPit.length > 0 ? mergePitchers(fgPit, svPit, dateMinIP, discPit) : DB[2026].pitchers;

      DB[2026].hitters   = newHitters;
      DB[2026].pitchers  = newPitchers;
      DB[2026].loaded    = true;
      DB[2026].lastFetch = Date.now();

      saveCache(newHitters, newPitchers);
      rebuildTeamDropdown(2026);

      // Update badge only if we successfully refreshed
      const badge = document.getElementById("s-badge");
      const rangeSuffix = _dateRange ? " · "+_dateRange.label : "";
      if(errors.length === 0){
        badge.textContent = "2026 LIVE" + rangeSuffix;
        badge.className = "s-badge badge-live";
      } else {
        badge.textContent = "2026 LIVE (partial)" + rangeSuffix;
        badge.className = "s-badge badge-loading";
      }

      render();
      console.log("[refreshLiveDataInBackground] Successfully updated with live data");
    } else {
      console.warn("[refreshLiveDataInBackground] No live data retrieved, keeping static version");
    }
  } catch(err){
    console.error("[refreshLiveDataInBackground] Unexpected error:", err);
  } finally {
    _fetching26 = false;
  }
}

// ── TAB HANDLERS ─────────────────────────────────────────────────────────────
function setSeason(yr){
  SEASON=yr; SCOL=null; SDIR=1;
  document.getElementById("stab-2025").classList.toggle("active", yr===2025);
  document.getElementById("stab-2026").classList.toggle("active", yr===2026);

  document.getElementById("refresh-btn").style.display = yr===2026 ? "flex" : "none";
  document.getElementById("date-card").style.display   = yr===2026 ? "block" : "none";

  // Update min-v filter based on season — crucial for early-season 2026 when no one has 100+ PA
  if(yr===2026 && typeof getSeasonThresholds === 'function'){
    const thr = getSeasonThresholds();
    document.getElementById("min-v").value = MODE==="hitters" ? thr.minAB : thr.minIP;
  } else if(yr===2025){
    document.getElementById("min-v").value = MODE==="hitters" ? "100" : "50";
  }

  if(yr===2025){
    stopAutoRefresh();
    const badge=document.getElementById("s-badge");
    badge.textContent="2025 FINAL"; badge.className="s-badge badge-final";
    rebuildTeamDropdown(2025);
    render();
  } else {
    startAutoRefresh();
    loadLive2026(); // handles cache check, loading, and rendering
  }
}

// data-mode attribute approach — avoids ANY quote-escaping in onclick HTML
function setModeBtn(btn){
  setMode(btn.getAttribute("data-mode"));
}

function setMode(m){
  MODE=m; SCOL=null; SDIR=1;
  document.getElementById("ptab-hit").classList.toggle("active", m==="hitters");
  document.getElementById("ptab-pit").classList.toggle("active", m==="pitchers");
  document.getElementById("role-row").style.display = m==="pitchers"?"block":"none";
  document.getElementById("tbl-mode").textContent   = "\u2014 "+(m==="hitters"?"Hitters":"Pitchers");
  document.getElementById("min-lbl").textContent    = m==="hitters"?"Min AB":"Min IP";
  // Season-aware minimum thresholds — use progressive thresholds for 2026, full-season for 2025
  if(SEASON === 2026 && typeof getSeasonThresholds === 'function'){
    const thr = getSeasonThresholds();
    document.getElementById("min-v").value = m==="hitters" ? thr.minAB : thr.minIP;
  } else {
    document.getElementById("min-v").value = m==="hitters" ? "100" : "50";
  }
  document.getElementById("srch").value             = "";
  buildAxes();
  render();
}

function buildAxes(){
  const ax=axes();
  ["x-sel","y-sel"].forEach((id,i)=>{
    const s=document.getElementById(id);
    s.innerHTML=ax.map(a=>"<option value=\""+a.k+"\">"+a.lbl+"</option>").join("");
    s.selectedIndex=i===0?0:Math.min(3,ax.length-1);
  });
  updDesc();
}

function updDesc(){
  const ax=axes(), x=ax.find(a=>a.k===xk()), y=ax.find(a=>a.k===yk());
  document.getElementById("x-src-tag").innerHTML=x?srcTag(x.src):"";
  document.getElementById("y-src-tag").innerHTML=y?srcTag(y.src):"";
  document.getElementById("x-desc").textContent=(x||{}).d||"";
  document.getElementById("y-desc").textContent=(y||{}).d||"";
}

function updAge(){
  document.getElementById("age-disp").textContent=
    document.getElementById("age-mn").value+"\u2013"+document.getElementById("age-mx").value;
}

// ── FILTER ───────────────────────────────────────────────────────────────────
function filt(){
  const d=dat(); if(!d||!d.length) return [];
  const tm   = document.getElementById("tm-sel").value;
  const amn  = +document.getElementById("age-mn").value;
  const amx  = +document.getElementById("age-mx").value;
  const mv   = +document.getElementById("min-v").value;
  const role = document.getElementById("role-sel").value;
  const q    = (document.getElementById("srch").value||"").toLowerCase().trim();
  return d.filter(p=>{
    if(tm!=="All Teams" && p.team!==tm) return false;
    if(p.age && (p.age<amn||p.age>amx)) return false;
    if(MODE==="hitters"  && (p.ab||p.pa||0)<mv) return false;
    if(MODE==="pitchers" && (p.ip||0)<mv) return false;
    if(MODE==="pitchers" && role!=="all" && p.role!==role) return false;
    if(q && !(p.name||"").toLowerCase().includes(q) && !(p.team||"").toLowerCase().includes(q)) return false;
    return true;
  });
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function render(){
  updDesc();
  const f=filt(), xKey=xk(), yKey=yk();
  const ax=axes(), xa=ax.find(a=>a.k===xKey), ya=ax.find(a=>a.k===yKey);
  const xl=xa?xa.lbl:xKey, yl=ya?ya.lbl:yKey;
  document.getElementById("p-cnt").textContent=f.length;
  document.getElementById("c-title").innerHTML=xl+" <em>vs</em> "+yl;
  document.getElementById("c-src-row").innerHTML=(xa?srcTag(xa.src):"")+" "+(ya?srcTag(ya.src):"");
  const xvs=f.map(p=>p[xKey]).filter(v=>v!=null&&!isNaN(v));
  const yvs=f.map(p=>p[yKey]).filter(v=>v!=null&&!isNaN(v));
  const xA=mean(xvs), yA=mean(yvs);
  const rangeTag = (SEASON===2026 && _dateRange)
    ? " &nbsp;&middot;&nbsp; <span style=\"color:var(--gold)\">"+_dateRange.label+"</span>"
    : "";
  document.getElementById("c-sub").innerHTML=
    "Origin = filtered average &nbsp;&middot;&nbsp; "+xl+" avg: <b>"+fv(xA)+"</b>"
    +" &nbsp;&middot;&nbsp; "+yl+" avg: <b>"+fv(yA)+"</b>"
    +" &nbsp;&middot;&nbsp; <span style=\"color:var(--fg2)\">"+f.length+"/"+dat().length+" players</span>"
    + rangeTag;
  document.getElementById("meta-txt").textContent=f.length+" of "+dat().length+" players";
  // dir: polarity multiplier — positive deviation = "better" for that stat
  const xDir = xa ? (xa.dir||1) : 1;
  const yDir = ya ? (ya.dir||1) : 1;

  const cd=f.map(p=>{
    const rawDiffX = p[xKey]!=null ? p[xKey]-xA : null;
    const rawDiffY = p[yKey]!=null ? p[yKey]-yA : null;
    return {
      ...p,
      rawX: p[xKey],
      rawY: p[yKey],
      cx: rawDiffX,            // raw deviation (for axis positioning)
      cy: rawDiffY,
      px: rawDiffX!=null ? rawDiffX * xDir : null,  // performance deviation (positive = better)
      py: rawDiffY!=null ? rawDiffY * yDir : null,
      xDir, yDir,
    };
  });
  drawScatter(cd,xl,yl,xDir,yDir); drawLegend(xl,yl,xDir,yDir); drawTable(cd,xl,yl);
}

// ── SCATTER ──────────────────────────────────────────────────────────────────
function drawScatter(data,xl,yl,xDir,yDir){
  const svg=document.getElementById("svg-plot");
  const W=900,H=470,PAD={t:26,r:22,b:50,l:54};
  const IW=W-PAD.l-PAD.r, IH=H-PAD.t-PAD.b;
  const vld=data.filter(d=>d.cx!=null&&d.cy!=null);
  if(!vld.length){
    svg.innerHTML="<text x=\""+(W/2)+"\" y=\""+(H/2)+"\" text-anchor=\"middle\" fill=\"#6b88aa\" "
      +"font-family=\"Barlow Condensed\" font-size=\"14\" letter-spacing=\"2\">NO DATA</text>";
    return;
  }
  // ── Plot using PERFORMANCE-ADJUSTED values (px/py) so "better" is always right & up ──
  // px = cx * xDir, py = cy * yDir → positive = better for that stat
  // This ensures ELITE is always in the upper-right quadrant regardless of stat polarity
  const pxs=vld.map(d=>d.px), pys=vld.map(d=>d.py);
  const xPad=(Math.max(...pxs)-Math.min(...pxs))*.1||1;
  const yPad=(Math.max(...pys)-Math.min(...pys))*.12||1;
  const xD=[Math.min(...pxs)-xPad, Math.max(...pxs)+xPad];
  const yD=[Math.min(...pys)-yPad, Math.max(...pys)+yPad];
  const sx=v=>PAD.l+(v-xD[0])/(xD[1]-xD[0])*IW;
  const sy=v=>PAD.t+(1-(v-yD[0])/(yD[1]-yD[0]))*IH;
  const x0=sx(0), y0=sy(0);
  const tks=(lo,hi,n)=>{
    const r=hi-lo, s=Math.pow(10,Math.floor(Math.log10(r/n)));
    let b=s; [1,2,5,10].forEach(m=>{const c=m*s;if(Math.abs(r/c-n)<Math.abs(r/b-n))b=c;});
    const st=Math.ceil(lo/b)*b, t=[];
    for(let v=st;v<=hi+1e-9;v+=b) t.push(parseFloat(v.toFixed(8)));
    return t;
  };
  let h="<defs><clipPath id=\"cp\"><rect x=\""+PAD.l+"\" y=\""+PAD.t
      +"\" width=\""+IW+"\" height=\""+IH+"\"/></clipPath></defs>";
  // X-axis ticks — convert performance values back to raw deviation for labels
  tks(xD[0],xD[1],8).forEach(v=>{
    const px=sx(v);
    h+="<line x1=\""+px+"\" y1=\""+PAD.t+"\" x2=\""+px+"\" y2=\""+(PAD.t+IH)
      +"\" stroke=\"rgba(45,36,24,.04)\" stroke-width=\"1\"/>";
    if(Math.abs(v)<1e-9) return;
    const rawV = v / (xDir||1);  // convert back to raw deviation for display
    h+="<text x=\""+px+"\" y=\""+(PAD.t+IH+16)+"\" text-anchor=\"middle\" class=\"tick\">"+fv(rawV)+"</text>";
  });
  // Y-axis ticks
  tks(yD[0],yD[1],7).forEach(v=>{
    const py=sy(v);
    h+="<line x1=\""+PAD.l+"\" y1=\""+py+"\" x2=\""+(PAD.l+IW)+"\" y2=\""+py
      +"\" stroke=\"rgba(45,36,24,.04)\" stroke-width=\"1\"/>";
    if(Math.abs(v)<1e-9) return;
    const rawV = v / (yDir||1);  // convert back to raw deviation for display
    h+="<text x=\""+(PAD.l-6)+"\" y=\""+(py+4)+"\" text-anchor=\"end\" class=\"tick\">"+fv(rawV)+"</text>";
  });
  // Quadrant fills — now simplified: better is ALWAYS right & up
  // Upper-right = ELITE (green), Upper-left = Strong Y (blue),
  // Lower-right = Strong X (orange), Lower-left = Below Avg (red)
  const rightTop = [x0,PAD.t,PAD.l+IW-x0,y0-PAD.t];
  const leftTop  = [PAD.l,PAD.t,x0-PAD.l,y0-PAD.t];
  const rightBot = [x0,y0,PAD.l+IW-x0,PAD.t+IH-y0];
  const leftBot  = [PAD.l,y0,x0-PAD.l,PAD.t+IH-y0];
  [
    {rect:rightTop, fill:"rgba(45,206,137,.06)"},   // elite: better X + better Y
    {rect:leftTop,  fill:"rgba(76,170,245,.05)"},   // strong Y only
    {rect:rightBot, fill:"rgba(240,140,58,.05)"},   // strong X only
    {rect:leftBot,  fill:"rgba(224,62,82,.05)"},    // below avg both
  ].forEach(({rect,fill})=>{
    const [qx,qy,qw,qh] = rect;
    if(qw>0&&qh>0) h+="<rect x=\""+qx+"\" y=\""+qy+"\" width=\""+qw+"\" height=\""+qh
      +"\" fill=\""+fill+"\" clip-path=\"url(#cp)\"/>";
  });
  // Axis lines
  h+="<line x1=\""+x0+"\" y1=\""+PAD.t+"\" x2=\""+x0+"\" y2=\""+(PAD.t+IH)
    +"\" stroke=\"rgba(76,170,245,.3)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\" clip-path=\"url(#cp)\"/>";
  h+="<line x1=\""+PAD.l+"\" y1=\""+y0+"\" x2=\""+(PAD.l+IW)+"\" y2=\""+y0
    +"\" stroke=\"rgba(76,170,245,.3)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\" clip-path=\"url(#cp)\"/>";
  // Axis labels — always: left=worse, right=better, down=worse, up=better
  h+="<text x=\""+(PAD.l+IW/2)+"\" y=\""+(H-3)+"\" text-anchor=\"middle\" class=\"ax-lbl\">"
    +"\u2190 WORSE   "+xl.toUpperCase()+" VS AVG   BETTER \u2192"
    +"</text>";
  h+="<text transform=\"rotate(-90)\" x=\""+(-(PAD.t+IH/2))+"\" y=\"14\" text-anchor=\"middle\" class=\"ax-lbl\">"
    +"\u2193 WORSE   "+yl.toUpperCase()+" VS AVG   BETTER \u2191"
    +"</text>";
  // Quadrant labels — ELITE always upper-right, BELOW AVG always lower-left
  if(QUADS){
    [
      ["end",   PAD.l+IW-5, PAD.t+12,    "#047857", "ELITE"],
      ["start", PAD.l+5,    PAD.t+12,    "#1D4ED8", "STRONG "+yl.toUpperCase()],
      ["end",   PAD.l+IW-5, PAD.t+IH-5, "#C2410C", "STRONG "+xl.toUpperCase()],
      ["start", PAD.l+5,    PAD.t+IH-5, "#B91C1C", "BELOW AVG"],
    ].forEach(([ta,x,y,c,txt])=>{
      h+="<text x=\""+x+"\" y=\""+y+"\" text-anchor=\""+ta+"\" class=\"qlbl\" fill=\""+c+"\">"+txt+"</text>";
    });
  }
  // Name labels — position by performance-adjusted values (px/py)
  if(NAMES) vld.forEach(d=>{
    const plotX=sx(d.px), plotY=sy(d.py), col=qcol(d.px,d.py);
    h+="<text x=\""+plotX+"\" y=\""+(plotY-8)+"\" text-anchor=\"middle\" class=\"namelbl\" fill=\""+col
      +"\" opacity=\"0.8\">"+(d.name||"").split(" ").slice(-1)[0]+"</text>";
  });
  // Dots — position and color by performance-adjusted values
  const r=vld.length>150?4:vld.length>80?5:6;
  vld.forEach((d,i)=>{
    const plotX=sx(d.px).toFixed(1), plotY=sy(d.py).toFixed(1), col=qcol(d.px,d.py);
    h+="<circle cx=\""+plotX+"\" cy=\""+plotY+"\" r=\""+r+"\" fill=\""+col+"\" fill-opacity=\".82\""
      +" stroke=\""+col+"\" stroke-width=\"1\" stroke-opacity=\".35\""
      +" style=\"cursor:pointer;transition:r .1s,fill-opacity .1s\""
      +" onmouseenter=\"showTip(event,"+i+")\" onmouseleave=\"hideTip()\""
      +" onmouseover=\"this.setAttribute('r','"+(r+2)+"');this.style.fillOpacity='1'\""
      +" onmouseout=\"this.setAttribute('r','"+r+"');this.style.fillOpacity='.82'\" onclick=\"openPlayerCard(document.getElementById('svg-plot')._vld["+i+"], MODE).catch(e=>console.error('Card error:',e))\"/>";
  });
  svg.innerHTML=h; svg._vld=vld; svg._xl=xl; svg._yl=yl;
}

// ── TOOLTIP ──────────────────────────────────────────────────────────────────
function showTip(e,i){
  const svg=document.getElementById("svg-plot"), d=svg._vld[i]; if(!d) return;
  document.getElementById("dt-name").textContent=d.name||"--";
  document.getElementById("dt-team").textContent=d.team||"--";
  document.getElementById("dt-pos").textContent=" "+(d.pos||d.role||"")+"\u00b7Age "+(d.age||"--");
  document.getElementById("dt-stats").innerHTML=tip().map(s=>
    "<div class=\"dt-stat\"><div class=\"dt-sv\">"+s.f(d[s.k])
    +"</div><div class=\"dt-sk\">"+s.lbl+"</div></div>").join("");
  const xl=svg._xl, yl=svg._yl;
  // Color the deviation by performance direction (px/py), not raw direction
  const xDevClass = (d.px>=0) ? "dev-pos" : "dev-neg";
  const yDevClass = (d.py>=0) ? "dev-pos" : "dev-neg";
  document.getElementById("dt-ax").innerHTML=
    "<div><div class=\"dt-ax-lbl\">"+xl+"</div><div class=\"dt-ax-val\">"+fv(d.rawX)+"</div>"
    +"<div class=\"dt-ax-dev "+xDevClass+"\">"+(d.cx>=0?"+":"")+fv(d.cx)+" vs avg</div></div>"
    +"<div><div class=\"dt-ax-lbl\">"+yl+"</div><div class=\"dt-ax-val\">"+fv(d.rawY)+"</div>"
    +"<div class=\"dt-ax-dev "+yDevClass+"\">"+(d.cy>=0?"+":"")+fv(d.cy)+" vs avg</div></div>";
  document.getElementById("dot-tip").style.display="block"; moveTip(e);
}
function moveTip(e){
  const t=document.getElementById("dot-tip"), tw=t.offsetWidth||220, th=t.offsetHeight||150;
  let l=e.clientX+16, tp=e.clientY-th/2;
  if(l+tw>window.innerWidth-8)  l=e.clientX-tw-16;
  if(tp<8) tp=8; if(tp+th>window.innerHeight-8) tp=window.innerHeight-th-8;
  t.style.left=l+"px"; t.style.top=tp+"px";
}
function hideTip(){ document.getElementById("dot-tip").style.display="none"; }
document.addEventListener("mousemove", e=>{
  if(document.getElementById("dot-tip").style.display==="block") moveTip(e);
});

// ── LEGEND ───────────────────────────────────────────────────────────────────
function drawLegend(xl,yl,xDir,yDir){
  // Legend uses performance language: "Better" = desirable direction
  document.getElementById("legend").innerHTML=[
    ["#047857","Elite — strong "+xl+" & "+yl],
    ["#1D4ED8","Strong "+yl+" only"],
    ["#C2410C","Strong "+xl+" only"],
    ["#B91C1C","Below avg both"],
  ].map(([c,l])=>"<div class=\"legend-row\"><div class=\"leg-dot\" style=\"background:"+c+"\"></div>"+l+"</div>").join("");
}

// ── TABLE ────────────────────────────────────────────────────────────────────
function drawTable(data,xl,yl){
  const isH=MODE==="hitters";
  const cols=isH
    ?["Player","Team","Pos","Age","AB","AVG / OPS / HR / SB / wRC+",xl,yl,xl+" vs avg",yl+" vs avg"]
    :["Player","Team","Role","Age","IP","ERA / FIP / WHIP / WAR",   xl,yl,xl+" vs avg",yl+" vs avg"];
  const si=SCOL!==null?SCOL:9;
  const sorted=[...data].sort((a,b)=>{
    const vals=[
      [a.name||"",b.name||""],[a.team||"",b.team||""],
      [isH?a.pos||"":a.role||"",isH?b.pos||"":b.role||""],
      [a.age||0,b.age||0],
      [isH?(a.ab||a.pa||0):(a.ip||0), isH?(b.ab||b.pa||0):(b.ip||0)],
      [0,0],
      [a.rawX??-9999,b.rawX??-9999],[a.rawY??-9999,b.rawY??-9999],
      [a.cx??-9999,b.cx??-9999],[a.cy??-9999,b.cy??-9999],
    ];
    const [va,vb]=vals[si]||[0,0];
    if(va<vb) return SDIR; if(va>vb) return -SDIR; return 0;
  });
  document.getElementById("t-head").innerHTML="<tr>"+cols.map((c,i)=>
    "<th class=\""+(i===si?"sorted":"")+"\" onclick=\"sortTbl("+i+")\">"+c
    +(i===si?(SDIR>0?" \u2193":" \u2191"):"")+"</th>").join("")+"</tr>";
  // Store sorted data globally for table click access
  window._tblData = sorted;
  document.getElementById("t-body").innerHTML=sorted.map((p,idx)=>{
    const sl=isH
      ?(p.avg!=null?p.avg.toFixed(3):"--")+"/"+(p.ops!=null?p.ops.toFixed(3):"--")
        +"/"+(p.hr!=null?Math.round(p.hr):"--")+"/"+(p.sb!=null?Math.round(p.sb):"--")
        +"/"+(p.wrc_plus!=null?Math.round(p.wrc_plus):"--")
      :(p.era!=null?p.era.toFixed(2):"--")+"/"+(p.fip!=null?p.fip.toFixed(2):"--")
        +"/"+(p.whip!=null?p.whip.toFixed(2):"--")+"/"+(p.war!=null?p.war.toFixed(1):"--");
    return "<tr style=\"cursor:pointer\" onclick=\"openPlayerCard(window._tblData["+idx+"], MODE).catch(e=>console.error('Card error:',e))\">"
      +"<td class=\"td-name\">"+(p.name||"--")+"</td>"
      +"<td><span class=\"td-tm\">"+(p.team||"--")+"</span></td>"
      +"<td style=\"color:var(--fg2);font-size:10px\">"+(isH?p.pos||"--":p.role||"--")+"</td>"
      +"<td class=\"td-n\">"+(p.age||"--")+"</td>"
      +"<td class=\"td-n\">"+(isH?p.ab||p.pa||"--":p.ip||"--")+"</td>"
      +"<td class=\"td-slash\">"+sl+"</td>"
      +"<td class=\"td-n\">"+fv(p.rawX)+"</td>"
      +"<td class=\"td-n\">"+fv(p.rawY)+"</td>"
      +"<td class=\""+((p.px??0)>=0?"td-pos":"td-neg")+"\">"+(((p.cx??0)>=0)?"+":"")+fv(p.cx)+"</td>"
      +"<td class=\""+((p.py??0)>=0?"td-pos":"td-neg")+"\">"+(((p.cy??0)>=0)?"+":"")+fv(p.cy)+"</td>"
      +"</tr>";
  }).join("");
  document.getElementById("tbl-note").textContent="Sorted by "+cols[si]+(SDIR>0?" \u2193":" \u2191");
}

function sortTbl(col){ if(SCOL===col)SDIR*=-1; else{SCOL=col;SDIR=col<=2?1:-1;} render(); }
function togNames(){ NAMES=!NAMES; ["tog-n","tog-n2"].forEach(id=>document.getElementById(id).classList.toggle("on",NAMES)); render(); }
function togQuads(){ QUADS=!QUADS; ["tog-q","tog-q2"].forEach(id=>document.getElementById(id).classList.toggle("on",QUADS)); render(); }

// ── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener("load", ()=>{
  showBar(false);
  buildAxes();
  updAge();

  // Auto-detect if 2026 season has started → default to 2026 LIVE tab
  const _openingDay2026 = new Date("2026-03-26");
  const _now = new Date();
  if(_now >= _openingDay2026){
    console.log("[init] 2026 season has started — auto-selecting 2026 LIVE tab");
    setSeason(2026); // This calls loadLive2026() which handles fetching + rendering
  } else {
    rebuildTeamDropdown(2025);
    render();
  }
});

// Attach search input listener after DOM is ready
document.getElementById("player-search").addEventListener("input", debounceSearch);

