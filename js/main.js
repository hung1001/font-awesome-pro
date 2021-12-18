const REPO = 'hung1001/font-awesome-pro';

let last_page = false,
  page = 1,
  listCommit = [];

while (!last_page) {
  $.ajax({
    url: `https://api.github.com/repos/${REPO}/commits?page=${page}`,
    dataType: 'json',
    async: false,
    success: (data) => {
      if (data.length > 0) {
        data.forEach((child) => listCommit.push(child));
        page++;
      } else {
        last_page = true;
      }
    },
  });
}

const listVersions = listCommit.map((arr) => {
  let regex = arr.commit.message.match(/\d+(\.\d+)+/g);
  if (regex != null) {
    arr.sha = arr.sha.slice(0, 7);
    arr.ver = regex[0];
  }
  return arr;
});

const removeDuplicate = listVersions.reduce((unique, value) => {
  if (!unique.some((obj) => obj.ver === value.ver)) {
    unique.push(value);
  }
  return unique;
}, []);

removeDuplicate.forEach((value) => {
  let { sha, ver } = value;
  if (ver) {
    $('#list-versions').append(`<option value='${sha}'>v${ver}</option>`);
    $('#archive').append(
      `<option data-link='https://github.com/${REPO}/archive/v${ver}.zip'>v${ver}</option>`
    );
  }
});

$('.js-select2').map(function (index, elem) {
  $(elem).select2({
    width: '100%',
    placeholder: $(elem).attr('data-placeholder') && $(elem).attr('data-placeholder'),
  });
});

const { sha, ver } = removeDuplicate[0];

$('.ver').text(ver);
$('#a').val(
  `<link href="https://cdn.jsdelivr.net/gh/${REPO}@${sha}/css/all.css" rel="stylesheet" type="text/css" />`
);
$('#c').val(
  `<link href="https://cdn.staticaly.com/gh/${REPO}/${sha}/css/all.css" rel="stylesheet" type="text/css" />`
);
$('#e').val(
  `<link href="https://rawcdn.githack.com/${REPO}/${sha}/css/all.css" rel="stylesheet" type="text/css" />`
);
$('head').append($('#a').val());

const replaceSHA = ({ element, sha }) =>
  $(element).val(
    $(element)
      .val()
      .replace(/[a-f0-9]{7}\//i, `${sha}/`)
  );

$('body').on('select2:select', '#list-versions', function () {
  const newSHA = $(this).val();

  ['#a', '#c', '#e'].forEach(function (element) {
    replaceSHA({
      element,
      sha: newSHA,
    });
  });
});

$('body').on('select2:select', '#archive', function () {
  window.open($(this).select2('data')[0].element.dataset.link, '_blank');
});

const copyObj = {
  item: {
    jsdelivr: {
      input: 'a',
      btn: 'b',
    },
    staticaly: {
      input: 'c',
      btn: 'd',
    },
    githack: {
      input: 'e',
      btn: 'f',
    },
  },
  copy: function () {
    for (let key in this.item) {
      if (this.item.hasOwnProperty(key)) {
        let btn = `#${this.item[key].btn}`,
          input = `#${this.item[key].input}`;
        $('body').on('click', btn, function () {
          if ($(input).val().length > 0 && navigator?.clipboard) {
            $(input).select();
            navigator.clipboard.writeText($(input).val());
          }
        });
      }
    }
  },
};

copyObj.copy();
